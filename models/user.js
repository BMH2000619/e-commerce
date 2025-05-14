const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    
  }

})

const User = mongoose.model('User', userSchema)
module.exports = User