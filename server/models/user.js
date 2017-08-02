var {mongoose} = require('./db/mongoose.js');

var User = mongoose.model('User', {
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 3
  }
})

module.exports = {User};
