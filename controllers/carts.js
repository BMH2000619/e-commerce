const express = require('express')
const router = express.Router()

const Cart = require('../models/cart')
const Product = require('../models/product')

// Routes/ API's/ Functionality

// POST /carts - Create a new Cart
router.post('/', async (req,res) => {
  const cart = await Cart.create({
      user: req.session.user._id,
      items: [],
      total: 0,
      status: 'active'
    })
  res.redirect(`/carts/${cart._id}/user/${req.session.user._id}`)
})

// GET /carts/:cartId/user/:userId - Get Cart for a user
router.get('/:cartId/user/:userId', async (req,res) => {
  const cart = await Cart.findOne({
    _id: req.params.cartId, 
    user: req.params.userId 
  }).populate('items.product')

  res.render('carts/show.ejs', { cart })
})

// POST /carts/:cartId/user/:userId/items - Add item to cart
router.post('/:cartId/user/:userId/items', async (req,res) => {
    const cart = await Cart.findById(req.params.cartId)
    const product = await Product.findById(req.body.productId)

    // check if product is already in cart
    const existingItem = cart.items.find(item => item.product.equals(product._id))
    if (existingItem) {
      // if item exists increase quantity 
      existingItem.quantity += Number(req.body.quantity)
    } else {
      // else item doesn't exist add to cart 
      cart.items.push({ product: product._id, quantity: req.body.quantity })
    }
    
    // update total price
    cart.total += product.price * req.body.quantity

    await cart.save()
    
    res.redirect(`/carts/${cart._id}/user/${req.params.userId}`)
})

// POST carts/:cartId/user/:userId/items/:itemId - Update quantity in cart  
router.post('/:cartId/user/:userId/items/:itemId', async (req,res) => {
  const cart = await Cart.findById(req.params.cartId).populate('items.product')
  const item = cart.items.id(req.params.itemId)

   // Calculate new quantity
  const oldQuantity = item.quantity
  const newQuantity = parseInt(req.body.quantity)
  const quantityDifference = newQuantity - oldQuantity
  
  // Update quantity
  item.quantity = newQuantity
  
  // Update total 
  cart.total += item.product.price * quantityDifference

  await cart.save()

  res.redirect(`/carts/${cart._id}/user/${req.params.userId}`)
})

// DELETE carts/:cartId/user/:userId/items/:itemId - Remove Item from cart
router.delete('/:cartId/user/:userId/items/:itemId', async (req,res) => {
  const cart = await Cart.findById(req.params.cartId).populate('items.product')
  const item = cart.items.id(req.params.itemId)

  //adjust total
  cart.total -= item.product.price * item.quantity

  item.remove()

  await cart.save()

  res.redirect(`/carts/${cart._id}/user/${req.params.userId}`)

})

// POST /carts/:cartId/user/:userId/checkout - checkout to set cart status to inactive
router.post('/:cartId/user/:userId/checkout', async (req,res) => {
  const cart = await Cart.findById(req.params.cartId)
  cart.status = 'inactive'
  await cart.save()
  res.redirect('/placeholder')
})


module.exports = router