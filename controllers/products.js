
const express = require('express');
const router = express.Router();

const Product = require('../models/product');
// There is no mo
const Category = require('./models/Category');

// Routes/ API's/ Functionality

router.get('/', async (req,res) => {
  const products = await Product.find()
  res.render('products/index.ejs', {products})
})

router.get('/new', async (req,res) => {
  const categories = await Category.find();
  res.render('products/new.ejs', {categories})
})


module.exports = router;