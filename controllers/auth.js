const express = require('express')
const router = express.Router()
const User = require('../models/user.js')
const bcrypt = require('bcrypt')

const Order = require('../models/order')
const Cart = require('../models/cart')

router.get('/sign-up', (req, res) => {
  res.render('auth/sign-up.ejs')
})

router.post('/sign-up', async (req, res) => {
  const userInDatabase = await User.findOne({ username: req.body.username })
  if (userInDatabase) {
    return res.send('Username already taken.')
  }

  const hashedPassword = bcrypt.hashSync(req.body.password, 10)
  req.body.password = hashedPassword

  const user = await User.create(req.body)

  req.session.user = {
    username: user.username,
    _id: user._id
  }

  req.session.save(() => {
    res.redirect('/')
  })
})

router.get('/sign-in', (req, res) => {
  res.render('auth/sign-in.ejs')
})

router.post('/sign-in', async (req, res) => {
  const userInDatabase = await User.findOne({ username: req.body.username })
  if (!userInDatabase) {
    return res.send('Login failed. Please try again.')
  }

  const validPassword = bcrypt.compareSync(
    req.body.password,
    userInDatabase.password
  )
  if (!validPassword) {
    return res.send('Login failed. Please try again.')
  }

  req.session.user = {
    username: userInDatabase.username,
    _id: userInDatabase._id
  }

  res.redirect('/products')
})

router.get('/sign-out', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

// GET /auth/profile - Show user profile
router.get('/profile', async (req, res) => {
  if (!req.session.user) return res.redirect('/auth/sign-in')
  const userId = req.session.user._id
  const user = await User.findById(userId)
  const carts = await Cart.find({ user: userId })
    
    const cartIds = []
    carts.forEach(cart => {
      cartIds.push(cart._id)
    })
    
    const orders = await Order.find({ cartId: { $in: cartIds } }).populate(
      {
        path: 'cartId',
        populate: { path: 'items.product' }
      })

    res.render('auth/profile.ejs', 
      { 
      user: user, 
      orders: orders 
    })
})

module.exports = router
