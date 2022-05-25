const express = require("express")
const router = express.Router()
const userController = require('../Controllers/userController')
const {auth} = require('../middleWare/auth')


router.post('/register',userController.createUser)
router.post('/login',userController.loginUser)
router.get('/user/:userId/profile',auth, userController.fetchData)
router.put("/user/:userId/profile",auth,userController.updateData)


module.exports = router