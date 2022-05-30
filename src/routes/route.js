const express = require("express")
const router = express.Router()
const userController = require('../Controllers/userController')
const {auth} = require('../middleWare/auth')
const productController = require('../Controllers/productController')
const cartController = require('../Controllers/cartController')

// User Api's

router.post('/register',userController.createUser)
router.post('/login',userController.loginUser)
router.get ('/user/:userId/profile',auth, userController.fetchData)
router.put ("/user/:userId/profile",auth, userController.updateData)

// Product Api's

router.post('/products',productController.createProduct)
router.get ('/products', productController.productByFilter)
router.get ('/products/:productId',productController.productById)
router.put ('/products/:productId', productController.updateProduct)
router.delete('/products/:productId', productController.deleteProduct)

router.post('/users/:userId/cart',cartController.addToCart)

router.put('/users/:userId/cart',cartController.updateProduct)









module.exports = router