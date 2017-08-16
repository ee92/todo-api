require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {User} = require('./models/user');
var {Todo} = require('./models/todo');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

// middleware to get parsed HTTP request body
app.use(bodyParser.json());

// POST route for adding to todos
app.post('/todos', (req, res) => {
  var todo = new Todo({
    task: req.body.task
  });
  // save to database
  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.send(e);
  });
});

// POST route for adding users
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email','password']);
  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  })
})

// GET route for fetching todos
app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send(todos)
  }, (e) => {
    res.send(e);
  })
})

// GET route for fetching todo by id
app.get('/todos/:id', (req, res) => {
  // get id from url
  var id = req.params.id;
  // validate id or return error
  if (!ObjectID.isValid(id)) {
    return res.status(404).send({"error": "invalid id"});
  };
  // find and return todo or error orject
  Todo.findById(id).then((doc) => {
    if (!doc) {
      return res.status(404).send({"error": "id not found"});
    }
    res.send(doc);
  }, (err) => {
    res.status(400).send({"error": "woops"});
  })
})

// DELETE route for todos by id
app.delete('/todos/:id', (req, res) => {
  // get id from url
  var id = req.params.id;
  // validate id or return error
  if (!ObjectID.isValid(id)) {
    return res.status(404).send({"error": "invalid id"});
  };
  // find and return todo or error orject
  Todo.findByIdAndRemove(id).then((doc) => {
    if (!doc) {
      return res.status(404).send({"error": "id not found"});
    }
    res.send(doc);
  }, (err) => {
    res.status(400).send({"error": "woops"});
  })
})

// UPDATE route for todos by id
app.patch('/todos/:id', (req, res) => {
  var id = req.params.id;
  // allow only these properties to be updated
  var body = _.pick(req.body, ['task', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send({"error": "invalid id"});
  };
  // if task completed set completedAt else reset to default
  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  };
  // update request body
  Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((doc) => {
    if (!doc) {
      return res.status(400).send();
    };
    res.send(doc);
  }).catch((err) => {
    res.status(400).send();
  });
});

// GET route for fetching by token
app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

// POST route for user login
app.post('/users/login', (req, res) => {
  var body = {
    email: req.body.email,
    password: req.body.password
  };

  User.findByLogin(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    res.status(400).send();
  });
});

// specifiy port for express
app.listen(port, () => {
  console.log("listening on port " + port);
});
// for server.test.js
module.exports = {app};
