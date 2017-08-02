var express = require('express');
var bodyParser = require('body-parser')

var {mongoose} = require('./db/mongoose.js');
var {User} = require('./models/user.js');
var {Todo} = require('./models/todo.js');

var app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  var todo = new
})


app.listen(3000, () => {
  console.log("listening on port 3000");
})
