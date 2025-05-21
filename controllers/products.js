const express = require('express')
const router = express.Router()

const Product = require('../models/product')
const Category = require('../models/category')
const Cart = require('../models/cart')
const isSignedIn = require('../middleware/is-signed-in')
const upload = require('../middleware/multer-config')


// Routes/ API's/ Functionality

// GET /products - List all Products
router.get('/', async (req, res) => {
  const products = await Product.find().populate('category')
  let cartId = null
  let userId = null

  if (req.session.user) {
    userId = req.session.user._id;
    let cart = await Cart.findOne({ user: userId, status: 'active' })
    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
        total: 0,
        status: 'active'
      })
    }
    cartId = cart._id
    const filteredProducts = products.filter(product => String(product.seller._id) !== String(userId));
    return res.render('products/index.ejs', {
      products: filteredProducts,
      user: userId,
      cartId,
      userId
    });
  }

  // If not logged in, show all products
  res.render('products/index.ejs', {
    products,
    user: null,
    cartId,
    userId
  })
})


// GET /products/new - Form to create new product
router.get('/new',isSignedIn ,async (req, res) => {
  const categories = await Category.find()
  res.render('products/new.ejs', { categories })
})

// POST /products - Form to create new product
router.post('/', isSignedIn, upload.single('img'), async (req, res) => {
  const seller = req.session.user._id
  const imgPath = req.file ? 'uploads/' + req.file.filename : ''
  const newProduct = new Product({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    quantity: req.body.quantity,
    img: imgPath,
    seller,
    category: req.body.category
  })

  await newProduct.save()
  res.redirect('/products')
})

// GET /products/seller - Show products owned by the logged-in user
router.get('/seller', isSignedIn, async (req, res) => {
  const userId = req.session.user._id;
  const products = await Product.find({ seller: userId }).populate('category');
  res.render('products/seller.ejs', { products, user: req.session.user });
})


// GET /products/productId - Show a Product
router.get('/:productId',isSignedIn, async (req,res) => {
  const product = await Product.findById(req.params.productId).populate('seller').populate('category')
  const userId = req.session.user._id

  // Find or create an active cart for this user
  let cart = await Cart.findOne({ user: userId, status: 'active' })

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
      total: 0,
      status: 'active'
    })
  }
  const cartId = cart._id

  res.render('products/show.ejs', {
    product,
    userId,
    cartId,
    user: req.session.user
  })
})

// GET /products/:productId/edit - Form to edit a product
router.get('/:productId/edit',upload.single('img'), isSignedIn ,async (req, res) => {
  const currentProduct = await Product.findById(req.params.productId)
  const categories = await Category.find()
  const imgPath = req.file ? 'uploads/' + req.file.filename : ''
  res.render('products/edit.ejs', { product: currentProduct, categories })
})

router.put('/:productId', upload.single('img'), async (req, res) => {
  try {
    const currentProduct = await Product.findById(req.params.productId)
    if (currentProduct.seller.equals(req.session.user._id)) {
  
      const updateData = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        quantity: req.body.quantity,
        category: req.body.category
      }
  
      if (req.file) {
        updateData.img = 'uploads/' + req.file.filename
      }
      await currentProduct.updateOne(updateData)
      res.redirect(`/products/${currentProduct._id}`)
    } else {
      res.send("You don't have permission to do that.")
    }
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
})

// DELETE /products/product:id - Delete product
router.delete('/:productId',isSignedIn ,async (req, res) => {
  const product = await Product.findById(req.params.productId)
  if (product.seller.equals(req.session.user._id)) {
    await product.deleteOne()
    res.redirect('/products')
  }
})

module.exports = router
