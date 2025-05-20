const express = require('express')
const router = express.Router()

const Product = require('../models/product')
const Category = require('../models/category')

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find()
    res.render('categories/index.ejs', { categories })
  } catch (err) {
    console.error(err)
    res.status(500).send('Server Error')
  }
})

// controllers/categories.js
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
    const products = await Product.find({ category: category._id })
    res.render('categories/show.ejs', { category: category, products })
  } catch (err) {
    res.status(500).send('Error fetching category')
  }
})
module.exports = router
