const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

var id = '698256f1c6c6abdaa864a0ed';

// validate ObjectID
if (!ObjectID.isValid(id)) {
  console.log('id invalid')
}

// // returns array
// Todo.find({
//   _id: id
// }).then((docs) => {
//   console.log(docs);
// });
//
// // returns object or null
// Todo.findOne({
//   _id: id
// }).then((doc) => {
//   console.log(doc);
// });
//
// // returns object or null
// Todo.findById(id).then((doc) => {
//   if (!doc) {
//     doc = 'id not found'
//   };
//   console.log(doc);
// }).catch((err) => {
//   console.log('invalid id');
// });

User.findById(id).then((doc) => {
  if (!doc) {
    doc = 'user not found';
  }
  console.log(doc);
}, (e) => {
  console.log('invalid user');
})
