const express = require('express')
const router = express.Router()
const User = require('../models/user.js')
const bcrypt = require('bcrypt')

const Order = require('../models/order')
const Cart = require('../models/cart')

const upload = require('../middleware/multer-config')
const isSignedIn = require('../middleware/is-signed-in.js')

router.get('/sign-up', (req, res) => {
  res.render('auth/sign-up.ejs')
})

router.post('/sign-up', upload.single('img'), async (req, res) => {
  const userInDatabase = await User.findOne({ username: req.body.username })
  if (userInDatabase) {
    return res.send('Username already taken.')
  }

  let profileImagePath = '';
    if (req.file) {
      profileImagePath = req.file.path.replace('public/', '')
    }

  const hashedPassword = bcrypt.hashSync(req.body.password, 10)
  req.body.password = hashedPassword

  const user = await User.create({
  username: req.body.username,
  email: req.body.email,
  phone: req.body.phone,
  address: req.body.address,
  password: hashedPassword,
  img: req.file ? 'uploads/' + req.file.filename : ''
})

req.session.user = {
  _id: user._id,
  username: user.username,
  email: user.email,
  phone: user.phone,
  address: user.address,
  img: user.img
};

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

  res.redirect('/')
})

router.get('/sign-out', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

// GET /auth/profile - Show user profile
router.get('/profile',isSignedIn ,async (req, res) => {
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

// GET /auth/profile/edit - show user the profile edit form
router.get('/profile/edit', isSignedIn, async (req, res) => {
  const userId = req.session.user._id
  const user = await User.findById(userId)
  res.render('auth/editProfile.ejs', { user })
})

// POST /auth/profile/edit - profile edited
router.post('/profile/edit', isSignedIn, upload.single('img'), async (req, res) => {
  const userId = req.session.user._id
  const updateData = {
    username: req.body.username,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address
  }
  if (req.file) {
    updateData.img = 'uploads/' + req.file.filename
  }
  await User.findByIdAndUpdate(userId, updateData)
  //update session info also
  Object.assign(req.session.user, updateData)
  res.redirect('/auth/profile')
})

module.exports = router
