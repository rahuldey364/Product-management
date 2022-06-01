const jwt = require('jsonwebtoken')
const userController = require('../Controllers/userController')



const auth = async (req,res, next) => {
    try{
        let header = req.header("Authorization")

        if(!header) return res.status(400).send({status:false, msg:"Token Required!!!"})
        
        let splitToken = header.split(" ")
        let token = splitToken[1]

        let decodedToken = jwt.verify(token, "ShippingCart_Group43" )
        if(!decodedToken) return res.status(400).send({status:false, msg:"Invalid Token!!"})
        
        if (Date.now() > decodedToken.exp * 1000) {
            return res.status(401).send({status: false,msg: "Session Expired",});
          }

        req.userId = decodedToken.userId
        next()
      //  console.log(decodedToken)
       
    }
     catch (err){
         return res.status(401).send({status:false , msg: err.message})     }
}

module.exports.auth = auth