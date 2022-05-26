const productModel = require("../Models/productModel")
const mongoose = require('mongoose')
const aws=require("aws-sdk")
const awsConfig = require("../awsConfig")
const productModel = require('../Models/productModel')

const keyValid = (key) => {
    if (typeof (key) === 'undefined' || typeof (key) === 'null') return false
    if (typeof (key) === 'String' && key.trim().length === 0) return false
    if (typeof (key) == 'Number' && key.toString().trim().length == 0) return false
    return true
}
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId);
  };

  const isValidRequestBody = function (reqBody) {
    return Object.keys(reqBody).length > 0
}
const isValidSizes = (availableSizes) => {
    return ["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(availableSizes) == -1

}

const createProduct = async function (req, res) {
    try {
        let data = JSON.parse(JSON.stringify(req.body))
        let files = req.files

        if (!files || files.length == 0) return res.status(400).send({ status: false, message: "Please enter image file!!" })

        let { title, discription, price, currencyId, currencyFormat,style, availableSizes , installments} = data


      
        let uploadedFileURL = await awsConfig.uploadFile(files[0])
        data.productImage = uploadedFileURL
        
        let saltRounds = await bcrypt.genSalt(10)
        let encryptedPassword = await bcrypt.hash(password, saltRounds)

          let data1 = {
           title:title,
           discription:discription,
           price:price,
           currencyId:currencyId,
           currencyFormat:currencyFormat,
           style:style,
           availableSizes:availableSizes,
           installments:installments,
           productImage: uploadedFileURL,
            phone: phone,
            password: encryptedPassword,
            address: address

        }
        
        //-----------------------------CREATING DATA-------------------------------------------------------------------------------//
        const createUser = await userModel.create(data1)
        return res.status(201).send({ status: true, Data: createUser })

    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, message: err.message })
    }
}



const productById = async function (req, res) {

    try {
        const productId = req.params.productId

        if (!keyValid(productId)) {
            return res.status(400).send({ status: false, message: "product Id is required" })
        }
        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "please enter valid productId" })
        }
        //DB call
        const allProduct = await productModel.findOne({ _id: productId, isdeleted: false })
        if (!allProduct) {
            return res.status(400).send({ status: false, message: "Product not found" })
        }
        return res.status(200).send({ status: true, message: "sucess", data: allProduct })

    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }

}


const updateProduct = async function(req, res){
   try{
    let productId=req.params.productId
    let requestBody = req.body
    let files = req.files

    if(!isValidObjectId(productId)) return res.status(400).send({status:false, message:"Please enter valid Id"})

    if(!isValidRequestBody(requestBody)) return res.status(400).send({status:false, message:"Please provide data"})
    //db call 
   let productDetails = await productModel.findOne({_id : productId, isDeleted: false})
   if(!productDetails) return res.status(404).send({status:false, message:"ProductDetails of the product are not found"})
   //destructuring
   const {title, discription, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments} = requestBody
  // validation starts
   if(!keyValid(title)) return res.status(400).send({status:false, message:"Please enter valid title"})
   if(!keyValid(discription)) return res.status(400).send({status:false, message:"Please enter valid discription"})
   if(!keyValid(price)) return res.status(400).send({status:false, message:"Please enter price"})
   if(!keyValid(currencyId))return res.status(400).send({status:false, message:"Please provide currencyId"})
   if(requestBody.currencyId.trim() !=="INR")return res.status(400).send({status:false, message:"Please provide valid Indian currencyId INR"})
   if(!keyValid(currencyFormat)) return res.status(400).send({status:false, message:"Please provide currencyFormat"})
   if (requestBody.currencyFormat.trim() !== "₹") return res.status(400).send({ status: false, message: "Please Provide a valid currencyFormat ₹" })
   if(!keyValid(isFreeShipping)) return res.status(400).send({status:false, message:"Please provide the value isFreeShipping"})
   if(!keyValid(style))return res.status(400).send({status:false, message:"Please provide products style"})
   if(!keyValid(availableSizes)) return res.status(400).send({status:false, message:"Size is required"})
   if(!isValidSizes(availableSizes)) return res.status(400).send({status:false, message:"please provide sizes in between in the ENUM Value"})
   if(!keyValid(installments))return res.status(400).send({status:false, message:"Please provide every installments"})
   //validation ends

   // file uploading
   let uploadedFileURL = await awsConfig.uploadFile(files[0])
   requestBody.profileImage = uploadedFileURL
   if(!uploadedFileURL) return res.status(400).send({ status:false, message:"No File Found" })

   const priceOfProduct= {title, discription, price, currencyId,currencyFormat, isFreeShipping, style, availableSizes,installments}

   const updatedProduct = await productModel.findOneAndUpdate({ _id: Id }, priceOfProduct, { new: true })

   return res.status(200).send({ status: true, message: "successfully updated producr", data: updatedProduct })
    
   }catch(err){
       console.log(err)
       return res.status(500).send({status:false, message:err.message})

   }
}

const deleteProduct = async (req,res)=> {
    try{
        const productId = req.params.productId

        //validation for productId
        if (!validator.isValidObjectId(productId)) 
            return res.status(400).send({ status: false, message: `${productId} is not a valid product id` })

        const product = await productModel.findOne({ _id: productId })

        if (!product) 
            return res.status(400).send({ status: false, message: `Product doesn't exists by ${productId}` })
            
        if (product.isDeleted == true)
            return res.status(400).send({ status: true, message: `Product has been already deleted.` })
            
        const deletedoc = await productModel.findOneAndUpdate({ _id: productId }, { $set: { isDeleted: true, deletedAt: new Date() } })

         return res.status(200).send({ status: true, message: `Product deleted successfully.`, data : deletedoc})
    }
    catch(error){
        res.status(500).sned({status : false, messsage : error.message})
    }
}


module.exports = { productById, updateProduct, createProduct, deleteProduct }