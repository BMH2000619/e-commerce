const express = require('express')
const router = express.Router()

const Cart = require('../models/cart')
const Product = require('../models/product')

// Function to Recalculate the total
const recalculateTotal = (cart) => {
  let total = 0

  cart.items.forEach((item) => {
    const price = item.product?.price
    const quantity = Number(item.quantity)

    // Only add if both price and quantity are valid numbers
    if (!isNaN(price) && !isNaN(quantity)) {
      total += price * quantity
    }
  })

  return total
}

// Routes/ API's/ Functionality

// POST /carts - Create a new Cart
router.post('/', async (req, res) => {
  // Check if there is active cart
  const isCartActive = await Cart.findOne({
    user: req.session.user._id,
    status: 'active'
  })

  if (isCartActive) {
    // Redirect to active cart
    res.redirect(`/carts/${isCartActive._id}/user/${req.session.user._id}`)
  } else {
    // Create new cart with active status
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

  // check if product is already in cart
  const existingItem = cart.items.find((item) =>
    item.product._id.equals(product._id)
  )
  if (existingItem) {
    // if item exists increase quantity
    existingItem.quantity += Number(req.body.quantity)
  } else {
    // else item doesn't exist add to cart
    cart.items.push({ product: product._id, quantity: req.body.quantity })
  }

  // Recalculate the total
  cart.total = recalculateTotal(cart)

  await cart.save()

  res.redirect(`/carts/${cart._id}/user/${req.params.userId}`)
})

// POST carts/:cartId/user/:userId/items/:itemId - Update quantity in cart
router.post('/:cartId/user/:userId/items/:itemId', async (req, res) => {
  const cart = await Cart.findById(req.params.cartId).populate('items.product')
  const item = cart.items.id(req.params.itemId)

  const newQuantity = parseInt(req.body.quantity)
  if (newQuantity <= 0) {
    return res.send('Invalid quantity')
  }

  item.quantity = newQuantity

  // Recalculate the total
  cart.total = recalculateTotal(cart)

  await cart.save()

  res.redirect(`/carts/${cart._id}/user/${req.params.userId}`)
})

// DELETE carts/:cartId/user/:userId/items/:itemId - Remove Item from cart
router.delete('/:cartId/user/:userId/items/:itemId', async (req, res) => {
  const cart = await Cart.findById(req.params.cartId).populate('items.product')
  const item = cart.items.id(req.params.itemId)

  item.remove()

  // Recalculate the total
  cart.total = recalculateTotal(cart)

  await cart.save()

  res.redirect(`/carts/${cart._id}/user/${req.params.userId}`)
})

// POST /carts/:cartId/user/:userId/checkout - checkout to set cart status to inactive
router.post('/:cartId/user/:userId/checkout', async (req, res) => {
  const cart = await Cart.findById(req.params.cartId).populate('items.product')
  cart.status = 'inactive'
  await cart.save()
  res.redirect('/placeholder')
})

module.exports = router
