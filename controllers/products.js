
const express = require('express');
const router = express.Router();

const Product = require('../models/product');

// Routes/ API's/ Functionality

router.get('/', (req,res) => {
  const products = products.find()
  res.render('products/index.ejs', {products})
})


module.exports = router;