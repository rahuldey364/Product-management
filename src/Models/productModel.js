const mongoose = require('mongoose')


const productModel = new mongoose.Schema({
    title:{
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description:{
        type: String,
        required: true,
        trim: true
    },
    price:{
        type: Number,
        required: true,
        //valid number
    },
    currencyId:{
        type: String,
        required: true,
        //INR
    },
    curreencyFormat:{
        type: String,
        required: true,
        trim: true
        //rupess symbol
    },
    isFreeShipping:{
        type: Boolean,
        default: false
    },
    productImage:{
        type: String,
        required: true,
    },
    style:{
        type: String,   
    },
    availableSizes:{
        type:[String],
        enum:["S", "XS","M","X", "L","XXL", "XL"]
    },
    installments:{
        type: Number,
        trim: true
    },
    deletedAt:{
        type: Date,
        default: null
    },
    isDeleted:{
        type: Boolean,
        default: false
    }
    
},{timestamps:true})

module.exports=mongoose.model('product',productModel)