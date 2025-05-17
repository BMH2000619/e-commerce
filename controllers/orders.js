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


// POST /orders - create new order from user's active cart
router.post('/', async (req, res) => {
  try {
    const userId = req.session.user._id;

    const activeCart = await Cart.findOne({ user: userId, status: 'active' });
    if (!activeCart) {
      return res.send('No active cart found.');
    }

    const order = await Order.create({ cartId: activeCart._id });

    // Mark the cart as inactive since it's been ordered
    activeCart.status = 'inactive';
    await activeCart.save();

    res.redirect(`/orders/${order._id}`);
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});


// GET /orders/:orderId - show a specific order
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate({
        path: 'cartId',
        populate: {
          path: 'user items.product',
        },
      });

    const isOwner = order.cartId.user._id.equals(req.session.user._id);

    res.render('orders/show.ejs', { order, isOwner });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});
