const express = require('express')
const router = express.Router()

const Product = require('../models/product')
// !!!!!!!!!!!!There is no model crested!!!!!!!!!!!!!!!!!!!!!!!!!!
const Category = require('./models/Category')

// Middleware
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// Routes/ API's/ Functionality

// GET /products - List all Products
router.get('/', async (req, res) => {
  const products = await Product.find().populate('category')
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
  const product = await Product.find(req.params.id).populate('category')
  res.render('/products/show.ejs', {product})
})

// GET /categories/:id/products - Show products within a category
router.get('/categories/:id/products', async (req,res) => {
  const products = await Product.findById(req.params.productId).populate('category')
  res.render('products/category.ejs', { products });
})

// GET /products/:productId/edit - Form to edit a product
router.get('/:productId/edit', async (req, res) => {
  const currentProduct = await Product.findById(req.params.productId).populate('category');
  const categories = await Category.find()
  res.render('products/edit.ejs', { product: currentProduct, categories })
})

module.exports = router
