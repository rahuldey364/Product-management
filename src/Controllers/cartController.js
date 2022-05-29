const cartModel = require('../Models/cartModel')
const mongoose = require('mongoose')

const keyValid = (key) => {
    if (typeof (key) === 'undefined' || typeof (key) === 'null') return false
    if (typeof (key) === 'String' && key.trim().length === 0) return false
    if (typeof (key) == 'Number' && key.toString().trim().length == 0) return false
    return true
}
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId);
};
// const createCart = async (req, res)=> {
//     try{
//     let data = req.body
//     let userId = data.params
    
  
  
//      let {items, totalPrice , totalItem, cartId, productId } = data

//      if(!isValidObjectId(userId)) 
//           return res.status(404).send({status:false , msg:"Please provide UserId"})
//     if(!data || (!keyValid(items))  || (!keyValid(totalPrice) || (!keyValid(totalItem)))) 
//           return res.status(403).send({status:false , msg:"Please Provide Data i.e. items or totalPrice or totalItem"})

    
//     const cartPresent = await cartModel.findOne({_id:cartId})
//     if (cartPresent) {
//          await cartModel.updateOne()
//     }
//     else{
//         const createCarteForUser = await cartModel.create(data)
//     }
    
    
    
//     }
// }