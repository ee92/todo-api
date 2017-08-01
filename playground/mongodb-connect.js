const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err){
    return console.log('unable to connect');
  }
  console.log('connected to mongodb');

  // db.collection('Todos').insertOne({
  //   'text' : 'something',
  //   'completed': false
  // }, (err, res) => {
  //   if (err) {
  //     return console.log('unable to insert');
  //   }
  //   console.log(res.ops);
  // });
  //
  // db.collection('Users').insertOne({
  //   'name' : 'egor',
  //   'age': 24,
  //   'location': 'usa'
  // }, (err, res) => {
  //   if (err) {
  //     return console.log('unable to insert');
  //   }
  //   console.log(res.ops[0]._id.getTimestamp());
  // });
  //
  // db.close();

  db.collection('Todos').find().toArray().then((list) => {
    console.log(list);
  }, (err) => {
    console.log(err);
  });
});
