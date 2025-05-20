const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const app = express()

// Middlewares
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const morgan = require('morgan')
const multer  = require('multer')
const session = require('express-session')
const bodyParser = require('body-parser')

const passUserToView = require('./middleware/pass-user-to-view')
const isSignedIn = require('./middleware/is-signed-in')

const Category = require('./models/category')


// Set the port from environment variable or default to 3000
const port = process.env.PORT ? process.env.PORT : '3009'

mongoose.connect(process.env.MONGODB_URI)

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`)
})


// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: false }))

// Middleware for using HTTP verbs such as PUT or DELETE
app.use(methodOverride('_method'))
// Morgan for logging HTTP requests
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({ extended: true }))

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
  })
)

app.use(passUserToView)

app.use(express.static('public'))

// Require controller
const productController = require('./controllers/products')
const orderController = require('./controllers/orders')
const categoryController = require('./controllers/categories')
const cartController = require('./controllers/carts')
const authController = require('./controllers/auth.js')

app.get('/', async(req, res) => 
  res.render('index.ejs', {
    user: req.session.user
  })
)

app.use('/auth', authController)
app.use('/products', productController)
app.use('/orders', orderController)
app.use('/categories', categoryController)
app.use('/carts', isSignedIn, cartController)

app.use(isSignedIn)

app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`)
})
