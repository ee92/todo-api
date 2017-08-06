var express = require('express');
var bodyParser = require('body-parser');
var {ObjectID} = require('mongodb');
var {mongoose} = require('./db/mongoose');
var {User} = require('./models/user');
var {Todo} = require('./models/todo');

var app = express();
const port = process.env.PORT || 3000;

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
    return res.send(doc);
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
    return res.send(doc);
  }, (err) => {
    res.status(400).send({"error": "woops"});
  })
})

// specifiy port for express
app.listen(port, () => {
  console.log("listening on port " + port);
});
// for server.test.js
module.exports = {app};
