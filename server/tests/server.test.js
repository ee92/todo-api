const expect = require('expect');
const supertest = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
  task: 'somehting'
}, {
  task: 'something else'
}];

beforeEach((done) => {
  Todo.remove({}).then(() => {
    Todo.insertMany(todos);
  }).then(() => done());
});

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var task = 'testing todo';

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

        Todo.find({task}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].task).toBe(task);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {

    supertest(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2)
      })
      .end(done);
  });
});
