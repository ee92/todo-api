var express = require('express');
var bodyParser = require('body-parser');
var {ObjectID} = require('mongodb');
var {mongoose} = require('./db/mongoose');
var {User} = require('./models/user');
var {Todo} = require('./models/todo');

var app = express();

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

// GET route for fetching user by id
app.get('/users/:id', (req, res) => {
  // get id from url
  var id = req.params.id;
  // validate id or return error
  if (!ObjectID.isValid(id)) {
    console.log('invalid id');
    return res.status(404).send({"error": "invalid id"});
  };
  // find and return user or error orject
  User.findById(id).then((doc) => {
    console.log(doc || "id not found");
    return res.send(doc || {"error": "id not found"})
  }, (err) => {
    res.status(400).send({"error": "woops"});
    console.log("woops");
  })
})

// specifiy port for express
app.listen(3000, () => {
  console.log("listening on port 3000");
});
// for server.test.js
module.exports = {app};
