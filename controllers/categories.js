const express = require('express')
const router = express.Router()

const Product = require('../models/product')
const Category = require('../models/category')

router.get('/', async (req, res) => {
  try {
    const categoryNames = await Product.distinct('category')
    res.render('categories/index.ejs', { categories: categoryNames })
  } catch (err) {
    console.error(err)
    res.status(500).send('Server Error')
  }
})

// controllers/categories.js
router.get('/:name', async (req, res) => {
  try {
    const categoryName = req.params.name
    const products = await Product.find({ category: categoryName })
    res.render('categories/show.ejs', { category: categoryName, products })
  } catch (err) {
    res.status(500).send('Error fetching category')
  }
})
module.exports = router
