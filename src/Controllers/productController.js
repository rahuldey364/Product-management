const productModel = require("../Models/productModel")
const mongoose = require('mongoose')
const aws = require("aws-sdk")
const awsConfig = require("../awsConfig")

const keyValid = (key) => {
    if (typeof (key) === 'undefined' || typeof (key) === 'null') return false
    if (typeof (key) === 'String' && key.trim().length === 0) return false
    if (typeof (key) == 'Number' && key.toString().trim().length == 0) return false
    return true
}
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId);
};

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
};

const createProduct = async function (req, res) {
    try {
        let data = JSON.parse(JSON.stringify(req.body))
        let files = req.files

        if (!files || files.length == 0)
            return res.status(400).send({ status: false, message: "Please enter image file!!" })

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "Please provide valid requestBody" })
        }

        let { title, description, price, currencyId, currencyFormat, style, availableSizes, installments } = data

        if (Object.keys(data).length == 0) { return res.status(400).send({ status: false, msg: "Please provide user data" }) }

        if (!keyValid(title))
            return res.status(400).send({ status: false, message: "title is Required" });

        if (!keyValid(title))
            return res.status(400).send({ status: false, message: "title  must be alphabetic characters" })

        const findTitle = await productModel.findOne({ title: title })
        if (findTitle)
            return res.status(400).send({ status: false, msg: "Title Already exist!!!" })

        if (!keyValid(description))
            return res.status(400).send({ status: false, message: "description is Required" });
        if (!keyValid(description))
            return res.status(400).send({ status: false, message: "description  must be alphabetic characters" })

        if (!(price))
            return res.status(400).send({ status: false, message: "price is Required" });
        if (isNaN(price)) return res.status(400).send({ status: false, message: "price must be in numeric" })


        if (!(currencyId))
            return res.status(400).send({ status: false, message: "currrencyId is Required" });
        if ((["INR"].indexOf(currencyId) == -1))
            return res.status(400).send({ status: false, message: "currency Id must be INR" })

        if (!(currencyFormat))
            return res.status(400).send({ status: false, message: "currrency formet is Required" });
        if ((["₹"].indexOf(currencyFormat) == -1))
            return res.status(400).send({ status: false, message: "currency formet must be ₹ " })

        if (!/^[A-Za-z ]+$/.test(style))
            return res.status(400).send({ status: false, message: "style must be alphabetic characters" })

        let sizes = availableSizes.split(/[\s,]+/)
        let arr = ["S", "XS", "M", "X", "L", "XXL", "XL"]
        console.log(sizes)
        for (let i = 0; i < sizes.length; i++) {
            if (arr.indexOf(sizes[i]) == -1)
                return res.status(400).send({ status: false, message: "availabe sizes must be (S, XS,M,X, L,XXL, XL)" })
        }
        data.availableSizes = sizes
        if (installments) {
            if (isNaN(installments)) return res.status(400).send({ status: false, message: "installments must be in numeric" })
        }


        let uploadedFileURL = await awsConfig.uploadFile(files[0])
        data.productImage = uploadedFileURL


        //-----------------------------CREATING DATA-------------------------------------------------------------------------------//
        const createUser = await productModel.create(data)
        return res.status(201).send({ status: true, message: "Success", data: createUser })

    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, message: err.message })
    }
}

const productByFilter = async function (req, res) {
    try {
        let query = req.query
        let filter = { isDeleted: false }
        const { name, size, priceGreaterThan, priceLessThan, priceSort } = query
        if (name) {
            filter.title = name
        }
        console.log(filter)
        if (size) {

            let asize = size.split(",")
            console.log(asize)

            // if (asize.length > 1) {
            //     let arr = []

            //     for (let i = 0; i < asize.length; i++) {
            //         if (["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(asize[i]) == -1) {
            //             return res
            //                 .status(400)
            //                 .send({ status: false, message: "size should be valid" });
            //         }
            //         if (["S", "XS", "M", "X", "L", "XXL", "XL"].includes(asize[i])) {
            //             // obj.availableSizes=asize[i]
            //             arr.push(asize[i])
            //         }
            //     }
            //     let newArr = arr.map((x) => { return { availableSizes: x } })
            //     console.log(newArr)
            //     filter.availableSizes = { $all: newArr }
            //     // console.log(newArr)
            // }
            filter.availableSizes = asize[0]
        }
        if (priceGreaterThan) {
            if (!(!isNaN(Number(priceGreaterThan)))) {
                return res.status(400).send({ status: false, message: 'Price should be a valid number' })
            }
            if (priceGreaterThan < 0) {
                return res.status(400).send({ status: false, message: 'Price can not be less than zero' })
            }

            filter.price = {}
            filter.price['$gt'] = Number(priceGreaterThan)
        }
        if (priceLessThan) {
            if (!(!isNaN(Number(priceLessThan)))) {
                return res.status(400).send({ status: false, message: 'Price should be a valid number' })
            }
            if (priceLessThan <= 0) {
                return res.status(400).send({ status: false, message: 'Price can not be zero or less than zero' })
            }
            filter.price = {}
            filter.price['$lt'] = Number(priceLessThan)
        }
        if (priceSort) {
            if (!((priceSort == 1) || (priceSort == -1))) {
                return res.status(400).send({ status: false, message: 'priceSort should be 1 or -1 ' })
            }
            const products = await productModel.find(filter).sort({ price: priceSort })
            if (products.length === 0) {
                return res.status(404).send({ productStatus: false, message: 'No Product found' })
            }
            return res.status(200).send({ status: true, message: 'Success', data: products })
        }
        console.log(filter)
        const products = await productModel.find(filter)
        if (products.length === 0) {
            return res.status(404).send({ Status: false, message: 'No Product found' })
        }
        return res.status(200).send({ status: true, message: 'Success', data: products })


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
            return res.status(404).send({ status: false, message: "Product not found" })
        }
        return res.status(200).send({ status: true, message: "Success", data: allProduct })

    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }

}


const updateProduct = async function (req, res) {
    try {
        let productId = req.params.productId
        let Data = JSON.parse(JSON.stringify(req.body))
        console.log(Data)
        let files = req.files

        if (!isValidObjectId(productId))
            return res.status(400).send({ status: false, message: "Please enter valid Id" })

        if (!isValidRequestBody(Data) && !files)
            return res.status(400).send({ status: false, message: "Please provide data" })
        //db call 
        let productDetails = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!productDetails)
            return res.status(404).send({ status: false, message: "ProductDetails of the product are not found" })
        //destructuring
        const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = Data
        // validation starts
        if (title) {
            if (!keyValid(title))
                return res.status(400).send({ status: false, message: "Please enter valid title" })
            let UniqueTitle = await productModel.findOne({ title: title })
            if (UniqueTitle) return res.status(400).send({ status: false, msg: "Title Already Exist!!" })

        }
        if (description) {
            if (!keyValid(description))
                return res.status(400).send({ status: false, message: "Please enter valid discription" })
        }
        if (price) {
            if (!keyValid(price) || (!/(\-?\d+\.?\d{0,2})/.test(price)))
                return res.status(400).send({ status: false, message: "Please enter price" })
        }

        if (currencyId) {
            if (!keyValid(currencyId) || (Data.currencyId.trim() !== "INR"))
                return res.status(400).send({ status: false, message: "Please provide currencyId and it Should be 'INR!!'" })

        }

        if (currencyFormat) {
            if (!keyValid(currencyFormat))
                return res.status(400).send({ status: false, message: "Please provide currencyFormat" })
            if (Data.currencyFormat.trim() !== "₹")
                return res.status(400).send({ status: false, message: "Please Provide a valid currencyFormat ₹" })
        }
        if (isFreeShipping) {
            if (!keyValid(isFreeShipping))
                return res.status(400).send({ status: false, message: "Please provide the value isFreeShipping" })
        }
        if (style) {
            if (!keyValid(style))
                return res.status(400).send({ status: false, message: "Please provide products style" })
        }
        if (availableSizes) {
            if (!keyValid(availableSizes))
                return res.status(400).send({ status: false, message: "Size is required" })
            if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(Data.availableSizes) !== -1)) {
                return res.status(400).send({ status: false, message: "please enter size One size at a time i.e. - S, XS, M, X, L, XXL, XL" })
            }
            for (let i = 0; i < productDetails.availableSizes.length; i++) {
                if (productDetails.availableSizes[i] == availableSizes) {
                    return res.status(400).send({ status: false, msg: "Size Already Exist!!" })
                }
            }

            await productModel.findOneAndUpdate({ _id: productId }, { $push: { availableSizes: availableSizes } })
        }


        if (installments) {
            if (!keyValid(installments))
                return res.status(400).send({ status: false, message: "Please provide every installments" })
        }

        //validation ends

        // file uploading
        if (files[0]) {

            let uploadedFileURL = await awsConfig.uploadFile(files[0])
            if (!uploadedFileURL)
                return res.status(400).send({ status: false, message: "No File Found" })
            Data.profileImage = uploadedFileURL

        }
        const updatedProduct = await productModel.findOneAndUpdate({ _id: productId }, { $set: Data }, { new: true })

        return res.status(200).send({ status: true, message: "successfully updated product", data: updatedProduct })

    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })

    }
}

const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.productId

        //validation for productId
        if (!isValidObjectId(productId))
            return res.status(400).send({ status: false, message: `${productId} is not a valid product id` })

        const product = await productModel.findOne({ _id: productId })

        if (!product)
            return res.status(400).send({ status: false, message: `Product doesn't exists by ${productId}` })

        if (product.isDeleted == true)
            return res.status(400).send({ status: true, message: `Product is either deleted or doesn't exist` })

        const deletedoc = await productModel.findOneAndUpdate({ _id: productId }, { isDeleted: true, deletedAt: new Date() }, {new:true})

        return res.status(200).send({ status: true, message: `Product deleted successfully.`, data: deletedoc })
    }
    catch (error) {
        res.status(500).send({ status: false, messsage: error.message })
    }
}


module.exports = { productById, updateProduct, createProduct, deleteProduct, productByFilter }