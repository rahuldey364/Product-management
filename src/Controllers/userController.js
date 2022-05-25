const userModel = require('../Models/userModel')
const mongoose = require('mongoose')
const awsConfig = require('../awsConfig')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')




const keyValid = (key) => {
    if (typeof (key) === 'undefined' || typeof (key) === 'null') return false
    if (typeof (key) === 'String' && key.trim().length === 0) return false
    if (typeof (key) == 'Number' && key.toString().trim().length == 0) return false
    return true
}

//-------regex validation----------
let NameRegex = /^(?![\. ])[a-zA-Z\. ]+(?<! )$/
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
let passwordRegex =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/
let addressRegex =/^[a-zA-Z ]{3,30}$/
let pincodeRegex = /^[1-9]\d{5}$/
let phoneRegex = /^[6-9]\d{9}$/

// -----------------createUser Api-----------------
const createUser = async function (req, res) {
    try {
        let data = JSON.parse(JSON.stringify(req.body))
        let files = req.files
        if (!files || files.length == 0) return res.status(400).send({ status: false, message: "Please enter image file!!" })

        let { fname, lname, email, address, password, phone } = data


        if (!keyValid(fname) || !NameRegex.test(fname)) return res.status(400).send({ status: false, message: "Please enter fname" })
        if (!keyValid(lname) || !NameRegex.test(lname)) return res.status(400).send({ status: false, message: "Please enter lname" })

        if (!keyValid(email)) return res.status(400).send({ status: false, message: "Please enter EmailId" })
        if (!emailRegex.test(email)) return res.status(400).send({ status: false, message: "Invalid email" })
        const findEmail = await userModel.findOne({ email: email })
        if (findEmail) return res.status(400).send({ status: false, msg: "Email Already exist!!!" })

        if (!keyValid(password)) return res.status(400).send({ status: false, message: "Invalid password" })
        if (!passwordRegex.test(password)) return res.status(400).send({ status: false, msg: "Please enter valid Password!!" })

        if (!address || Object.keys(address).length == 0) return res.status(400).send({ status: false, message: "Please enter address and it should be in object!!" })
        address = JSON.parse(data.address)
        if (Object.keys(address.shipping).length == 0) return res.status(400).send({ status: false, message: "Please enter shipping address and it should be in object!!" })
        if (!keyValid(address.shipping.street)) return res.status(400).send({ status: false, message: "Invalid Shipping street" })
        if (!addressRegex.test(address.shipping.street)) return res.status(400).send({ status: false, message: "Invalid Shipping Street Name" })
        if (!keyValid(address.shipping.city)) return res.status(400).send({ status: false, message: "Invalid Shipping city" })
        if (!addressRegex.test(address.shipping.city)) return res.status(400).send({ status: false, message: "Invalid Shipping City Name" })
        if (!pincodeRegex.test(address.shipping.pincode)) return res.status(400).send({ status: false, message: "Invalid Shipping pincode" })

        if (!address.billing) return res.status(400).send({ status: false, message: "Please enter Billing address and it should be in object!!" })
        if (!keyValid(address.billing.street)) return res.status(400).send({ status: false, message: "Please Enter Billing street Name" })
        if (!addressRegex.test(address.billing.street)) return res.status(400).send({ status: false, message: "Invalid Billing Street Name" })
        if (!keyValid(address.billing.city)) return res.status(400).send({ status: false, message: "Please enter Billing City Name" })
        if (!addressRegex.test(address.billing.city)) return res.status(400).send({ status: false, message: "Invalid Billing City Name" })
        if (!pincodeRegex.test(address.billing.pincode)) return res.status(400).send({ status: false, message: "Invalid Billing pincode" })

        if (!phone) return res.status(400).send({ status: false, message: "Phone number is required" })
        if (!phoneRegex.test(phone)) return res.status(400).send({ status: false, message: "Invalid Number" })
        const existingMobile = await userModel.findOne({ phone: phone })
        if (existingMobile) return res.status(400).send({ status: false, message: "Mobile number is already exists" })



        let uploadedFileURL = await awsConfig.uploadFile(files[0])
        data.profileImage = uploadedFileURL

        let saltRounds = await bcrypt.genSalt(10)
        let encryptedPassword = await bcrypt.hash(password, saltRounds)


        let data1 = {
            fname: fname,
            lname: lname,
            email: email,
            profileImage: uploadedFileURL,
            phone: phone,
            password: encryptedPassword,
            address: address

        }

        const createUser = await userModel.create(data1)
        return res.status(201).send({ status: true, Data: createUser })

    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, message: err.message })
    }
}

// -------------------Login User-----------------------

const loginUser = async (req, res) => {
    try {
        let data = req.body
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Please enter your details to login" })

        const { email, password } = data

        if (!keyValid(email)) {
            return res.status(400).send({ status: false, message: "Email is required" })
        }
        if (!keyValid(password)) {
            return res.status(400).send({ status: false, message: "Password is required" })
        }

        const userEmail = await userModel.findOne({ email: email })
        if (!userEmail) return res.status(401).send({ status: false, message: "Invalid EmailId" })

        let encryptPassword = await bcrypt.compare(password, userEmail.password)
        console.log(encryptPassword)
        if (!encryptPassword) return res.status(401).send({ Status: false, Msg: "Email or Password is InCorrect!!!" })
        //compare password

        const token = jwt.sign({ userId: userEmail._id }, "ShippingCart_Group43", { expiresIn: "24 hours" })
        res.status(200).send({ status: true, message: "User login Successfully", Data: { userId: userEmail._id, token: token } })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

// ------------------get Api---------------------------

const getApi = async (req,res) => {
    try{
        let userId = req.params.userId
        let findUser =  await userModel.findOne({_id : userId})
        if(!findUser) return res.status(404).send({status : false, message : `${userId} doesn't exist`})
        
        res.status(201).send({status :true, message: "User profile details", data : findUser})
    }
    catch(error){
        res.status(500).send({status : false, message : error.message})
    }
}


const PutApi = async (req,res) => {
    try{
        let userId = req.params.userId
        let data = req.body
        let files = req.files
        if (!data) return res.status(400).send({ status: false, message: "Data is not present in request body" })
        if (data.fname) {
            if (!keyValid(data.fname) || !NameRegex.test(data.fname)) {
                return res.status(400).send({ status: false, message: "first name is not Valid" })
            }
        }
        if (data.lname) {
            if (!keyValid(data.lname) || !NameRegex.test(data.lname)) {
                return res.status(400).send({ status: false, msg: "last name is not Valid" })
            }
        }
        if (data.email) {
            if (!keyValid(data.email) || !emailRegex.test(data.email)) {
                return res.status(400).send({ status: false, msg: "email is not Valid" })
            }
            let uniqueEmail = await userModel.findOne({ email: data.email })
            if (uniqueEmail) return res.status(409).send({ status: false, msg: " email already exists" })
        }
        if (files && files.length != 0) {
            let uploadedFileURL = await awsConfig.uploadFile(files[0])
            data.profileImage = uploadedFileURL
        }
        if (data.phone) {
            if (!keyValid(data.phone) || !phoneRegex.test(data.phone)) {
                return res.status(400).send({ status: false, msg: "Phone no is not Valid" })
            }
            let uniquePhone= await userModel.findOne({ phone: data.phone })
            if (uniquePhone) return res.status(409).send({ status: false, message: "unable to change ,phone no already exists" })
        }
        if (data.password) {
            let saltRounds = await bcrypt.genSalt(10)
            let encryptedPassword = await bcrypt.hash(data.password, saltRounds)
            data.password= encryptedPassword
        }
        
        if(data.address && Object.keys(data.address).length != 0){
            if(!data.address.shipping )
            // data.address =JSON.parse(data.address)
            // if (data.address.shipping && Object.keys(data.address.shipping).length != 0){
            //     if(data.address.shipping.street && Object.keys(data.address.shipping.street).length != 0){
            //         if (!keyValid(data.address.shipping.street)) return res.status(400).send({ status: false, message: "Invalid Shipping street" })
            //     }
            //     if(data.address.shipping.city && Object.keys(data.address.shipping.city).length != 0){
            //         if (!keyValid(data.address.shipping.city)) return res.status(400).send({ status: false, message: "Invalid Shipping city" })
            //     }
            //     if(data.address.shipping.pincode && Object.keys(data.address.shipping.pincode).length != 0){
            //         if (!keyValid(data.address.shipping.city)) return res.status(400).send({ status: false, message: "Invalid Shipping city" })
            //     }
            // }
            // if (data.address.billing && Object.keys(data.address.billing).length != 0){
            //     if(data.address.billing.street && Object.keys(data.address.billing.street).length != 0){
            //         if (!keyValid(data.address.billing.street)) return res.status(400).send({ status: false, message: "Invalid billing street" })
            //     }
            //     if(data.address.billing.city && Object.keys(data.address.billing.city).length != 0){
            //         if (!keyValid(data.address.shipping.city)) return res.status(400).send({ status: false, message: "Invalid billing city" })
            //     }
            //     if(data.address.billing.pincode && Object.keys(data.address.billing.pincode).length != 0){
            //         if (!keyValid(data.address.billing.city)) return res.status(400).send({ status: false, message: "Invalid billing city" })
            //     }
            // }
        }




        let updateUser =  await userModel.findOneAndUpdate({_id : userId},{
            $set: {
                fname: data.fname,
                lname: data.lname,
                email: data.email,
                profileImage: data.profileImage,
                phone:data.phone,
                password:data.password,
                address: data.address

        }},{new:true})
        if(!updateUser) return res.status(404).send({status : false, message : `${userId} doesn't exist`})

        res.status(201).send({status :true, message: "User profile details", data : updateUser})
    }
    catch(error){
        console.log(error)
        res.status(500).send({status : false, message : error.message})
    }
}


module.exports = { createUser, loginUser, getApi ,PutApi}


//===========







