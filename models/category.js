const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  name: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    require: true
  }
})

const Category = mongoose.model('Category', categorySchema)
module.exports = Category
