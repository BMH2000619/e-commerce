const router = require('express').Router()
const Order = require('../models/order')
const Product = require('../models/product')

// GET /orders - list all orders
router.get('/', async (req, res) => {
  const orders = await Order.find().populate('user').populate('items.product')
  res.render('orders/index.ejs', { orders })
})

// GET /orders/new - form to create new order
router.get('/new', async (req, res) => {
  const products = await Product.find()
  res.render('orders/new.ejs', { products })
})

// POST /orders - create a new order
router.post('/', async (req, res) => {
  try {
    const { productIds, quantities, total } = req.body

    const items = productIds.map((productId, idx) => ({
      product: productId,
      quantity: parseInt(quantities[idx])
    }))

    await Order.create({
      user: req.session.user._id,
      items,
      total,
      status: 'pending'
    })

    res.redirect('/orders')
  } catch (err) {
    console.error(err)
    res.redirect('/')
  }
})

// GET /orders/:orderId - show a specific order
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user')
      .populate('items.product')

    const isOwner = order.user._id.equals(req.session.user._id)

    res.render('orders/show.ejs', { order, isOwner })
  } catch (err) {
    console.error(err)
    res.redirect('/')
  }
})

// GET /orders/:orderId/edit - form to edit order (only owner)
router.get('/:orderId/edit', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate(
      'items.product'
    )
    if (order.user.equals(req.session.user._id)) {
      const products = await Product.find()
      res.render('orders/edit.ejs', { order, products })
    } else {
      res.send("You don't have permission to edit this order.")
    }
  } catch (err) {
    console.error(err)
    res.redirect('/')
  }
})

// PUT /orders/:orderId - update the order (only owner)
router.put('/:orderId', async (req, res) => {
  try {
    const { productIds, quantities, total, status } = req.body

    const items = productIds.map((productId, idx) => ({
      product: productId,
      quantity: parseInt(quantities[idx])
    }))

    const order = await Order.findById(req.params.orderId)
    if (order.user.equals(req.session.user._id)) {
      await order.updateOne({
        items,
        total,
        status
      })
      res.redirect(`/orders/${req.params.orderId}`)
    } else {
      res.send("You don't have permission to update this order.")
    }
  } catch (err) {
    console.error(err)
    res.redirect('/')
  }
})

// DELETE /orders/:orderId - delete order (only owner)
router.delete('/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
    if (order.user.equals(req.session.user._id)) {
      await order.deleteOne()
      res.redirect('/orders')
    } else {
      res.send("You don't have permission to delete this order.")
    }
  } catch (err) {
    console.error(err)
    res.redirect('/')
  }
})

module.exports = router
