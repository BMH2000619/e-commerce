const router = require('express').Router()
const Order = require('../models/order')
const Cart = require('../models/cart')

// GET /orders - list all orders
router.get('/', async (req, res) => {
  const orders = await Order.find().populate({
    path: 'cartId',
    populate: {
      path: 'user items.product'
    }
  })

  res.render('orders/index.ejs', { orders })
})
