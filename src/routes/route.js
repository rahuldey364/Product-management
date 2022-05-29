const express = require("express")
const router = express.Router()
const userController = require('../Controllers/userController')
const {auth} = require('../middleWare/auth')
const productController = require('../Controllers/productController')


router.post('/register',userController.createUser)

router.post('/login',userController.loginUser)

router.get ('/user/:userId/profile',auth, userController.fetchData)

router.put ("/user/:userId/profile",userController.updateData)

router.post('/products',productController.createProduct)

router.get ('/products', productController.productByFilter)

router.get ('/products/:productId',productController.productById)

router.put ('/products/:productId', productController.updateProduct)

router.delete('/products/:productId', productController.deleteProduct)



module.exports = router