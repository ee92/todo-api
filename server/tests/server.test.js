const expect = require('expect');
const supertest = require('supertest');
const {ObjectID} = require('mongodb');
const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, users, populateTodos, populateUsers} = require('./seed/seed')

// remove all from todos/users and add defaults before each test
beforeEach(populateUsers);
beforeEach(populateTodos);

// test POST method for todos
describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var task = 'testing todo';
    //adds task to todos
    supertest(app)
      .post('/todos')
      .send({task})
      .expect(200)
      .expect((res) => {
        expect(res.body.task).toBe(task)
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        // should find just the added task
        Todo.find({task}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].task).toBe(task);
          done();
        }).catch((e) => done(e));
      });
  });
});

// test GET method for todos
describe('GET /todos', () => {
  it('should get all todos', (done) => {
    // gets all todos and checks there is only two
    supertest(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBe(2)
      })
      .end(done);
  });
});

// test GET method for fetching todo by id
describe('GET /todos/:id', () => {
  it('should get a todo by id', (done) => {
    // request todo by id and check its correct
    supertest(app)
      .get('/todos/' + todos[0]._id.toHexString())
      .expect(200)
      .expect((res) => {
        expect(res.body.task).toBe(todos[0].task);
      })
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();
    // request todo of unused id and check for 404
    supertest(app)
      .get('/todos/' + hexId)
      .expect(404)
      .end(done);
  });

  it('shouldreturn 404 for invalid id', (done) => {
    supertest(app)
      .get('/todos/abc123')
      .expect(404)
      .end(done);
  })
});

// test DELETE method for removing todo by id
describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    var hexId = todos[1]._id.toHexString();
    // delete second todo
    supertest(app)
      .delete('/todos/' + hexId)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(hexId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        // asserts second todo doesnt exist
        Todo.findById(hexId).then((doc) => {
          expect(doc).toNotExist();
          done();
        }).catch((err) => done(e))
      });
  });

  it('should return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();
    // request todo of unused id and check for 404
    supertest(app)
      .delete('/todos/' + hexId)
      .expect(404)
      .end(done);
  });

  it('should return 404 for invalid id', (done) => {
    supertest(app)
      .delete('/todos/abc123')
      .expect(404)
      .end(done);
  });
});

// test PATCH method for updating todo completion
describe('PATCH /todos/:id', () => {
  it('should update todo completed to true', (done) => {
    var hexId = todos[0]._id.toHexString();
    // request to update complete to true
    supertest(app)
      .patch('/todos/' + hexId)
      .send({
        completed : true
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.completed).toBe(true);
        expect(res.body.completedAt).toBeA('number');
      })
      .end(done);
  });

  it('should update todo completed to false', (done) => {
    var hexId = todos[1]._id.toHexString();
    // request to update complete to false
    supertest(app)
      .patch('/todos/' + hexId)
      .send({
        completed : false
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.completed).toBe(false);
        expect(res.body.completedAt).toBe(null);
      })
      .end(done);
  });
})

// test GET method for /user/me
describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    supertest(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    supertest(app)
      .get('/users/me')
      .expect(401)
      .end(done);
  });
});

// test POST method for creating user
describe('POST /users', () => {
  it('should create a user', (done) => {
    var email = '1@test.com';
    var password = 'password';

    supertest(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email)
      })
      .end(done);
  });

  it('should return errors if invalid fields', (done) => {
    var email = 'bad email';
    var password = '123';

    supertest(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done);
  });

  it('should not create user if email already in use', (done) => {
    var email = '1@abc.com';
    var password = 'user1pass';

    supertest(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done);
  });
})

// test POST method for user login
describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    supertest(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[0]).toInclude({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      });
  });

  it('should reject invalid login', (done) => {
    supertest(app)
      .post('/users/login')
      .send({
        email: 'jimmy@james.com',
        password: 'scoobydoo'
      })
      .expect(400)
      .end(done);
  });
});

// test for user logout
describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    supertest(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });
});
