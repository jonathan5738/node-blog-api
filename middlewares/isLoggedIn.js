const User = require('../models/user') 
const jwt = require('jsonwebtoken') 

const isLoggedIn = async (req, res, next) => {
    try{
        if(!req.user){
            const token = req.headers.authorization.split(' ')[1]
            const decode = jwt.verify(token, process.env.JWT_SECRET)
            const user = await User.findById({_id: decode._id})
            if(!user) throw new Error('user not found')
            req.user = user
        }
        next()
    } catch(err){
        return res.status(500).send({ error: 'unable to authenticate' })
    }
}
module.exports = isLoggedIn