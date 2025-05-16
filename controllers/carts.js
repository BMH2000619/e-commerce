const express = require('express')
const router = express.Router()

const Cart = require('../models/cart')
const Product = require('../models/product')

// Routes/ API's/ Functionality

// GET /carts - Create a new Cart
router.get('/', async (req,res) => {
  const cart = await Cart.create({
      user: req.session.user._id,
      items: [],
      total: 0,
      status: 'active'
    })
  res.redirect(`/carts/${cart._id}`)
})






module.exports = router