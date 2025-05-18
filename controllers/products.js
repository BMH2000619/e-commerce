const express = require('express')
const router = express.Router()

const Product = require('../models/product')
const Category = require('../models/category')
const Cart = require('../models/cart')


// Routes/ API's/ Functionality

// GET /products - List all Products
router.get('/', async (req, res) => {
  const products = await Product.find()
  res.render('products/index.ejs', { products })
})

// GET /products/new - Form to create new product
router.get('/new', async (req, res) => {
  const categories = await Category.find()
  res.render('products/new.ejs', { categories })
})

// POST /products - Form to create new product
router.post('/', isSignedIn, async (req, res) => {
  const seller = req.session.user._id
    const newProduct = new Product({
      ...req.body,
      seller 
    })

  await newProduct.save()
  res.redirect('/products')
})

// GET /products/productId - Show a Product
router.get('/:productId', isSignedIn, async (req,res) => {
  const product = await Product.findById(req.params.productId).populate('seller')
  const userId = req.session.user._id;

  const cart = await Cart.findOne({
    user: userId,
    status: 'active'
  })

// Set cartId to null if no active cart
  const cartId = cart ? cart._id : null

  res.render('products/show.ejs', {product, userId, cartId})
})

// GET /products/:productId/edit - Form to edit a product
router.get('/:productId/edit', async (req, res) => {
  const currentProduct = await Product.findById(req.params.productId)
  res.render('products/edit.ejs', { product: currentProduct })
})

router.put('/:productId', async (req, res) => {
  try {
    const currentProduct = await Product.findById(req.params.productId)
    if (currentProduct.seller.equals(req.session.user._id)) {
      await currentProduct.updateOne(req.body)
      res.redirect('/products')
    } else {
      res.send("You don't have permission to do that.")
    }
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
})

// DELETE /products/product:id - Delete product
router.delete('/:productId', async (req, res) => {
  const product = await Product.findById(req.params.productId)
  if (product.seller.equals(req.session.user._id)) {
    await product.deleteOne()
    res.redirect('/products')
  }
})

module.exports = router
