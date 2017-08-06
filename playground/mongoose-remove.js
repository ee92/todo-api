const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// // remove all todos
// Todo.remove({}).then((result) => {
//   console.log(result);
// })

// remove one todo by id
Todo.findByIdAndRemove('59879efdf2f89904cc694f27').then((doc) => {
  console.log(doc);
});
