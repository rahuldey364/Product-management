const express = require("express")
const router = express.Router()
const {auth} = require('../middleWare/auth')
const userController = require('../Controllers/userController')
const productController = require('../Controllers/productController')
const cartController = require('../Controllers/cartController')
const orderController = require("../Controllers/orderController")

//Feature I User Api's

router.post('/register',userController.createUser)
router.post('/login',userController.loginUser)
router.get ('/user/:userId/profile',auth, userController.fetchData)
router.put ("/user/:userId/profile",auth, userController.updateData)

//Feature II Product Api's

router.post('/products',productController.createProduct)
router.get ('/products', productController.productByFilter)
router.get ('/products/:productId',productController.productById)
router.put ('/products/:productId', productController.updateProduct)
router.delete('/products/:productId', productController.deleteProduct)

// Feature III Cart Api's 

router.post('/users/:userId/cart',auth,cartController.addToCart)
router.put('/users/:userId/cart',auth,cartController.updateProduct)
router.get('/users/:userId/cart',auth,cartController.getCart)
router.delete('/users/:userId/cart',auth,cartController.deleteCartByUserId)


//Feature IV Order API's

router.post('/users/:userId/orders', auth,orderController.createOrder)
router.put('/users/:userId/orders', auth, orderController.updateOrder)














module.exports = router