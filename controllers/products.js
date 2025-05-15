const express = require('express')
const router = express.Router()

const Product = require('../models/product')
const Category = require('../models/category')


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
router.post('/', async (req, res) => {
  const newProduct = new Product(req.body)
  await newProduct.save()
  res.redirect('/products')
})

// GET /products/productId - Show a Product
router.get('/:productId', async (req,res) => {
  const product = await Product.find(req.params.id)
  res.render('/products/show.ejs', {product})
})

// GET /products/:productId/edit - Form to edit a product
router.get('/:productId/edit', async (req, res) => {
  const currentProduct = await Product.findById(req.params.productId)
  res.render('products/edit.ejs', { product: currentProduct })
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
