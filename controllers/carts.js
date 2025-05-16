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
  res.redirect(`/carts/${cart._id}/users/${userId}`)
})

// GET /carts/:cartId/user/:userId - Get Cart for a user
router.get('/:cartId/users/:userId', async (req,res) => {
  const cart = await Cart.findOne({ _id: req.params.cartId, users: req.params.userId })
    .populate('items.product');
  res.render('carts/show.ejs', { cart });
})

// POST /carts/:cartId/users/:userId/items - Add item to cart
router.post('/carts/:cartId/users/:userId/items', async (req,res) => {
    const cart = await Cart.findById(req.params.cartId);
    const product = await Product.findById(req.body.productId);

    const existingItem = cart.items.find(item => item.product.equals(product._id));
    if (existingItem) {
      existingItem.quantity += Number(req.body.quantity);
    } else {
      cart.items.push({ product: product._id, quantity: req.body.quantity });
    }
    
    cart.total += product.price * req.body.quantity;

    await cart.save();
    
    res.redirect(`/carts/${cart._id}/users/${user._id}`);
})







module.exports = router