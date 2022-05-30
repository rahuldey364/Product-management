const mongoose = require('mongoose')
const cartModel = require('../Models/cartModel')
const productModel = require('../Models/productModel')
const userModel = require('../Models/userModel')

const keyValid = (key) => {
    if (typeof (key) === 'undefined' || typeof (key) === 'null') return false
    if (typeof (key) === 'String' && key.trim().length === 0) return false
    if (typeof (key) == 'Number' && key.toString().trim().length == 0) return false
    return true
}
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
};


let isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}
const validQuantity = function isInteger(value) {
    if (value < 1) return false
    if (isNaN(Number(value))) return false
    if (value % 1 == 0) return true
}



const addToCart = async function (req, res) {
    try {
        const userId = req.params.userId;
        const requestBody = req.body;

        // let userIdFromToken = req.userId;

        // validation starts
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please provide valid requestBody" })
        }

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "please provide valid userId" })
        }

        const { productId, quantity } = requestBody

        if (!isValidObjectId(productId) || !keyValid(productId)) {
            return res.status(400).send({ status: false, message: "Please provide valid ProductId" })
        }
        if (!keyValid(quantity) || !validQuantity(quantity)) {
            return res.status(400).send({ status: false, message: "Please provide valid Quantity and it must be greater than Zero!" })
        }
        //Validation ends

        const findUser = await userModel.findById({ _id: userId })
        if (!findUser) return res.status(404).send({ status: false, message: `User doesn't exist by ${userId}` })

        // Authorization
        if (findUser._id.toString() != req.userId)
            return res.status(403).send({ status: false, message: `Unauthorized access! User's info doesn't match` })

        const findProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!findProduct) {
            return res.status(404).send({ status: false, message: `Product doesn't exist by ${productId}` })
        }

        // finding cart related to user.
        const findCartOfUser = await cartModel.findOne({ userId: userId })

        if (!findCartOfUser) {

            let priceSum = findProduct.price * quantity
            let itemArr = [{ productId: productId, quantity: quantity }]

            const newUserCart = await cartModel.create({
                userId: userId,
                items: itemArr,
                totalPrice: priceSum,
                totalItems: 1
            })
            return res.status(201).send({ status: true, message: "Success", data: newUserCart })
        }

        if (findCartOfUser) {

            //updating price when products get added or removed
            let price = findCartOfUser.totalPrice + (req.body.quantity * findProduct.price)
            let arr = findCartOfUser.items

            
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].productId == productId) {
                    arr[i].quantity += quantity
                    let cartUpdate = await cartModel.findOneAndUpdate({ _id: findCartOfUser._id }, { totalPrice: price, items: arr, totalItems: arr.length }, { new: true })
                    return res.status(200).send({ status: true, message: "data updated", data: cartUpdate })
                }
            }

            arr.push({ productId: productId, quantity: quantity })
            let cartUpdate = await cartModel.findOneAndUpdate({ _id: findCartOfUser._id }, { totalPrice: price, items: arr, totalItems: arr.length }, { new: true })
            return res.status(200).send({ status: true, message: "data updated", data: cartUpdate })
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, message: err.message })
    }
}


const updateProduct = async function(req, res) {
    try{
         let data = req.body
         let userId = req.params.userId

         const existUser = await userModel.findOne({_id:userId})
         if(!existUser) return res.status(404).send({status:false, message:"Please enter valid UserId"})

           //Authorization
           if (existUser._id != req.userId)
           return res.status(403).send({ status: false, message: `Unauthorized access! User's info doesn't match` })

         if(!keyValid(userId) || !isValidObjectId(userId)) return res.status(400).send({status:false, message:"Please enter vaild userId"})

         const {productId, cartId, removeProduct} = data

         const isCartExist = await cartModel.findOne({_id:cartId})
         if(!isCartExist) return res.status(404).send({status:false, message:"Please enter valid CartId"})

         const isExistProduct = await productModel.findOne({_id:productId, isDeleted:false})
         if(!isExistProduct) return res.status(404).send({status:false, message:"Please enter valid productId"})

         const findProduct = await cartModel.findOne({items:{$elemMatch:{productId:productId}}})
         if(!findProduct) return res.status(400).send({status:false, message:"product does not exist"})

        if(removeProduct < 0 && removeProduct > 1) return res.status(400).send({status:false, message:"Please enter valid value of removeProduct"})
        let arr = isCartExist.items
        if(removeProduct == 0){
          for(let i=0; i< arr.length; i++){

            
             
            // if()return res.status(400).send({status:false, message: "This product is not present in the cart"})
          }
        }else {
        
            
        }
 
        



         

        


         



         

    }catch(err){
        console.log(err)
        res.status(500).send({status:false, message: err.message})
    }
}

const getCart = async function(req,res){
    try{
        let userId = req.params.userId
        if (!userId) {
            return res.status(400).send({ status: false, message: "enter a user Id  first", });
        }
        const isValidUser = await userModel.findOne({ _id: userId, isDeleted: false })    
        if (!isValidUser) {
            return res.status(404).send({
                status: false,
                message: "not a valid user"
            });
        }
        const getCart = await cartModel.findOne({ userId: userId })
        if(!getCart){
            return res.status(404).send({
                status: false,
                message: "cart not found"
        })}

        res.status(200).send({ status: true, data: getCart });
    
    }
    catch(err){
        console.log(err)
        res.status(500).send({status:false, message: err.message})
    }
}












module.exports = { addToCart, updateProduct }