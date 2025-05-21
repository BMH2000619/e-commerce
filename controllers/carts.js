const express = require('express')
const router = express.Router()

const Cart = require('../models/cart')
const Product = require('../models/product')

// Function to Recalculate the total
const recalculateTotal = (cart) => {
  let total = 0
  cart.items.forEach((item) => {
    const price = item.product.price
    const quantity = Number(item.quantity)
    total += price * quantity
  })
  return total
}

// GET /carts - Create a new Cart
router.get('/', async (req, res) => {
  const isCartActive = await Cart.findOne({
    user: req.session.user._id,
    status: 'active'
  })

  if (isCartActive) {
    res.redirect(`/carts/${isCartActive._id}/user/${req.session.user._id}`)
  } else {
    const cart = await Cart.create({
      user: req.session.user._id,
      items: [],
      total: 0,
      status: 'active'
    })
    res.redirect(`/carts/${cart._id}/user/${req.session.user._id}`)
  }
})

// GET /carts/:cartId/user/:userId - Get Cart for a user
router.get('/:cartId/user/:userId', async (req, res) => {
  const cart = await Cart.findOne({
    _id: req.params.cartId,
    user: req.params.userId
  }).populate('items.product')

  res.render('carts/show.ejs', { cart })
})

// POST /carts/:cartId/user/:userId/items - Add item to cart
router.post('/:cartId/user/:userId/items', async (req, res) => {
  const cart = await Cart.findById(req.params.cartId).populate('items.product')

  const product = await Product.findById(req.body.productId)

  // Validate and parse quantity
  const quantity = parseInt(req.body.quantity)
  console.log(quantity)
  if (isNaN(quantity) || quantity <= 0) {
    return res.status(400).send('Invalid quantity')
  }

  // check if product is already in cart
  const existingItem = cart.items.find((item) =>
    item.product._id.equals(product._id)
  )

  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.items.push({ product: product._id, quantity })
  }

  //populate objectId before recalculating to avoid quantity being NaN
  await cart.populate('items.product')
  cart.total = recalculateTotal(cart)
  await cart.save()
  res.redirect(`/carts/${cart._id}/user/${req.params.userId}`)
})

// POST /carts/:cartId/user/:userId/items/:itemId - Update quantity in cart
router.post('/:cartId/user/:userId/items/:itemId', async (req, res) => {
  const cart = await Cart.findById(req.params.cartId).populate('items.product')
  const item = cart.items.id(req.params.itemId)
  const product = item.product

  // Validate and parse new quantity
  const newQuantity = parseInt(req.body.quantity, 10)
  if (isNaN(newQuantity) || newQuantity <= 0) {
    return res.status(400).send('Invalid quantity')
  }

  item.quantity = newQuantity

  //populate objectId before recalculating to avoid quantity being NaN
  await cart.populate('items.product')
  cart.total = recalculateTotal(cart)
  await cart.save()
  res.redirect(`/carts/${cart._id}/user/${req.params.userId}`)
})

// DELETE /carts/:cartId/user/:userId/items/:itemId - Remove Item from cart
router.delete('/:cartId/user/:userId/items/:itemId', async (req, res) => {
  const cart = await Cart.findById(req.params.cartId).populate('items.product')
  cart.items = cart.items.filter((item) => !item._id.equals(req.params.itemId))
  //populate objectId before recalculating to avoid quantity being NaN
  await cart.populate('items.product')
  cart.total = recalculateTotal(cart)
  await cart.save()
  res.redirect(`/carts/${cart._id}/user/${req.params.userId}`)
})

// POST /carts/:cartId/user/:userId/checkout - checkout to set cart status to inactive
router.post('/:cartId/user/:userId/checkout', async (req, res) => {
  const cart = await Cart.findById(req.params.cartId).populate('items.product')
  cart.status = 'inactive'
  await cart.save()
  res.redirect('/orders/:orderId')
})

module.exports = router
