const mongoose = require('mongoose')
const userModel = require("../Models/userModel")
const cartModel = require("../Models/cartModel")
const productModel = require("../Models/orderModel")
const orderModel = require('../Models/orderModel')


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


const createOrder = async function (req, res) {
    try {
        let userId = req.params.userId
        let data = req.body
        // validation starts
        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "Please provide valid requestBody" })
        }

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "please provide valid userId" })
        }
        //DB call
        let existUser = await userModel.findOne({ userId })
        if (!existUser) {
            return res.status(404).send({ status: false, message: "User does not exist" })
        }

        // //  Authorization
        // if (existUser._id.toString() != req.userId)
        //     return res.status(403).send({ status: false, message: `Unauthorized access! User's info doesn't match` })


        let { cartId, status, cancellable } = data

        if (!keyValid(cartId) || !isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: "Please provide cartId and valid" })
        }
        // DB call
        let findCart = await cartModel.findOne({ _id: cartId, userId: userId })
        if (!findCart) return res.status(404).send({ status: false, message: "cart doesn't belongs to userId" })

        if (cancellable) {
            if ((typeof (cancellable) !== 'boolean')) return res.status(400).send({ status: false, message: "cancellable must be boolean, either true or false" })
        }
        console.log(cancellable)
        if (!cancellable && typeof (cancellable) == "undefined") {
            cancellable = true
        }
        console.log(cancellable)

        if (!status) {
            status = 'pending'
        }
        if (status) {
            if (['pending'].indexOf(status) == -1) {
                return res.status(400).send({ status: false, message: "Please enter valid status" })
            }
        }

        let arr = findCart.items
        if (arr.length == 0) return res.status(400).send({ status: false, message: "cart is empty add's some items" })
        let totalQuantity = 0

        for (let i = 0; i < arr.length; i++) {
            totalQuantity = totalQuantity + arr[i].quantity
        }

        const orderDetails = {
            userId: userId,
            items: findCart.items,
            totalPrice: findCart.totalPrice,
            totalItems: findCart.totalItems,
            totalQuantity: totalQuantity,
            cancellable: cancellable,
            status: status

        }

        const order = await orderModel.create(orderDetails)

        await cartModel.findOneAndUpdate({ _id: cartId, userId: userId}, { items: [], totalPrice: 0, totalItems: 0 })
     

        return res.status(201).send({ status: true, message: "Order created successfully", data:order})

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


const updateOrder = async function (req, res) {
    try {
        let userId = req.params.userId
        let data = req.body

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "Please provide data in the body" })
        }
        if (!keyValid(userId) || !isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please provide valid userId" })
        }
        //db call
        const existUser = await userModel.findOne({ _Id: userId })
        if (!existUser) return res.status(404).send({ status: false, message: "userId doesn't exist" })

        // //  Authorization
        // if (existUser._id.toString() != req.userId)
        //     return res.status(403).send({ status: false, message: `Unauthorized access! User's info doesn't match` })

        const { orderId, status } = data

        if (!keyValid(orderId) || !isValidObjectId(orderId)) {
            return res.status(400).send({ status: false, message: "Please provide valid orderId" })
        }

        //db call
        const findOrder = await orderModel.findOne({ _id: orderId, userId: userId, isDeleted:false })
        if (!findOrder) return res.status(404).send({ status: false, message: "Order not found" })

        if (status) {
            if (['completed', 'cancelled'].indexOf(status) == -1) {
                return res.status(400).send({ status: false, message: "Please enter valid status, (cancelled or completed)" })
            }
        }

        if (status == "cancelled") {
            if (findOrder.cancellable == true) {
                const updatedOrder = await orderModel.findOneAndUpdate({ _id: orderId }, { status: status }, { new: true }).select({isDeleted:0})
                return res.status(200).send({ status: true, message: "Order cancelled sucessfully", data: updatedOrder })
            } else {
                return res.status(400).send({ status: false, message: "order can't be cancelled" })
            }
        }

        if (status == "completed") {
            const updatedOrder = await orderModel.findOneAndUpdate({ _id: orderId }, { status: status }, { new: true }).select({isDeleted:0})
            return res.status(200).send({ status: true, message: "Order compeletd sucessfully", data: updatedOrder })
        }

    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, message: err.message })
        return
    }
}

module.exports = { createOrder, updateOrder }