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

  // Filter orders where the cart's user matches the logged-in user
  const userOrders = orders.filter(order =>
  order.cartId &&
  order.cartId.user &&
  order.cartId.user._id &&
  req.session.user &&
  req.session.user._id &&
  order.cartId.user._id.equals(req.session.user._id)
)


  res.render('orders/index.ejs', { orders: userOrders })
})

// POST /orders - create new order from user's active cart
router.post('/', async (req, res) => {
  try {
    const userId = req.session.user._id

    const activeCart = await Cart.findOne({ user: userId, status: 'active' })
    if (!activeCart) {
      return res.send('No active cart found.')
    }

    const order = await Order.create({ cartId: activeCart._id })

    // Mark the cart as inactive since it's been ordered
    activeCart.status = 'inactive'
    await activeCart.save()

    res.redirect(`/orders/${order._id}`)
  } catch (err) {
    console.error(err)
    res.redirect('/')
  }
})

// GET /orders/:orderId - show a specific order
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate({
      path: 'cartId',
      populate: {
        path: 'user items.product'
      }
    })

    const isOwner = order.cartId.user._id.equals(req.session.user._id)

    res.render('orders/show.ejs', { order, isOwner })
  } catch (err) {
    console.error(err)
    res.redirect('/')
  }
})

// PUT /orders/:orderId - update order status (e.g., admin functionality)
router.put('/:orderId', async (req, res) => {
  try {
    const { status } = req.body
    await Order.findByIdAndUpdate(req.params.orderId, { status })
    res.redirect(`/orders/${req.params.orderId}`)
  } catch (err) {
    console.error(err)
    res.redirect('/')
  }
})

// DELETE /orders/:orderId - delete order (optional)
router.delete('/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('cartId')

    if (order.cartId.user.equals(req.session.user._id)) {
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
