const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product'
    },
    quantity: {
      type: Number
    }
  }],
  total: {
    type: Number
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  }
})

const Cart = mongoose.model('Cart', cartSchema)
module.exports = Cart
