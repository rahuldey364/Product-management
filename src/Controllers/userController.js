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



// -----------------createUser Api-----------------
const createUser = async function (req, res) {
    try {
        let data = JSON.parse(JSON.stringify(req.body))
        let files = req.files
        if (!files || files.length == 0) return res.status(400).send({ status: false, message: "Please enter image file!!" })

        let { fname, lname, email, address, password, phone } = data


        if (!keyValid(fname) || !/^(?![\. ])[a-zA-Z\. ]+(?<! )$/.test(fname)) return res.status(400).send({ status: false, message: "Please enter fname" })
        if (!keyValid(lname) || !/^(?![\. ])[a-zA-Z\. ]+(?<! )$/.test(lname)) return res.status(400).send({ status: false, message: "Please enter lname" })

        if (!keyValid(email)) return res.status(400).send({ status: false, message: "Please enter EmailId" })
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) return res.status(400).send({ status: false, message: "Invalid email" })
        const findEmail = await userModel.findOne({ email: email })
        if (findEmail) return res.status(400).send({ status: false, msg: "Email Already exist!!!" })

        if (!keyValid(password)) return res.status(400).send({ status: false, message: "Invalid password" })
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/.test(password)) return res.status(400).send({ status: false, msg: "Please enter valid Password!!" })

        if (!address || Object.keys(address).length == 0) return res.status(400).send({ status: false, message: "Please enter address and it should be in object!!" })
        address = JSON.parse(data.address)
        if (Object.keys(address.shipping).length == 0) return res.status(400).send({ status: false, message: "Please enter shipping address and it should be in object!!" })
        if (!keyValid(address.shipping.street)) return res.status(400).send({ status: false, message: "Invalid Shipping street" })
        if (!/^[a-zA-Z ]{3,30}$/.test(address.shipping.street)) return res.status(400).send({ status: false, message: "Invalid Shipping Street Name" })
        if (!keyValid(address.shipping.city)) return res.status(400).send({ status: false, message: "Invalid Shipping city" })
        if (!/^[a-zA-Z ]{3,30}$/.test(address.shipping.city)) return res.status(400).send({ status: false, message: "Invalid Shipping City Name" })
        if (!/^[1-9]\d{5}$/.test(address.shipping.pincode)) return res.status(400).send({ status: false, message: "Invalid Shipping pincode" })

        if (!address.billing) return res.status(400).send({ status: false, message: "Please enter Billing address and it should be in object!!" })
        if (!keyValid(address.billing.street)) return res.status(400).send({ status: false, message: "Please Enter Billing street Name" })
        if (!/^[a-zA-Z ]{3,30}$/.test(address.billing.street)) return res.status(400).send({ status: false, message: "Invalid Billing Street Name" })
        if (!keyValid(address.billing.city)) return res.status(400).send({ status: false, message: "Please enter Billing City Name" })
        if (!/^[a-zA-Z ]{3,30}$/.test(address.billing.city)) return res.status(400).send({ status: false, message: "Invalid Billing City Name" })
        if (!/^[1-9]\d{5}$/.test(address.billing.pincode)) return res.status(400).send({ status: false, message: "Invalid Billing pincode" })

        if (!phone) return res.status(400).send({ status: false, message: "Phone number is required" })
        if (!/^[6-9]\d{9}$/.test(phone)) return res.status(400).send({ status: false, message: "Invalid Number" })
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
        let useerId = req.params.userId
        let findUser =  await userModel.findOne({_id : userId})
        if(!findUser) return res.status(404).send({status : false, message : `${useerId} doesn't exist`})
        
        res.status(201).send({status :true, message: "User profile details", data : findUser})
    }
    catch(error){
        res.status(500).send({status : false, message : error.message})
    }
}

module.exports = { createUser, loginUser, getApi }





