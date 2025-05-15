const express = require('express')
const router = express.Router()

const Product = require('../models/product')
const Category = require('../models/category')


router.get('/', async (req, res) => {
  try {
    const categories = await Category.find()
    res.render('categories/index.ejs', { categories }) // or res.json(categories);
  } catch (err) {
    res.status(500).send('Server Error')
  }
})

router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
    const products = await Product.find({ category: category._id }).populate(
      'category'
    )
    res.render('categories/show.ejs', { category, products }) // or return JSON
  } catch (err) {
    res.status(500).send('Error fetching category')
  }
})

module.exports = routers