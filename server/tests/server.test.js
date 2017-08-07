const expect = require('expect');
const supertest = require('supertest');
const {ObjectID} = require('mongodb');
const {app} = require('./../server');
const {Todo} = require('./../models/todo');

// two default tasks
const todos = [{
  _id: new ObjectID,
  task: 'somehting'
}, {
  _id: new ObjectID,
  task: 'something else',
  completedAt: 1502138169672,
  completed: true
}];

// remove all from todos and add defaults before each test
beforeEach((done) => {
  Todo.remove({}).then(() => {
    Todo.insertMany(todos);
  }).then(() => done());
});

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
