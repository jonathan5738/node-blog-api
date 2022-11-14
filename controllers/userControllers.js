const User = require('../models/user') 
const bcrypt = require('bcrypt')
const signUser = async (req, res, next) => {
    const {username, first_name, last_name, email, password} = req.body 
    try{
        const user = await User.create({username, last_name, first_name, email, password})
        const token = await user.generateAuthToken()
        return res.status(201).send({user: { _id: user._id, first_name: user.first_name }, token})
    } catch(err){
        return res.status(400).send({ error: err.message })
    }
}

const loginUser = async (req, res, next) => {
    const {username, password} = req.body
    try{
        const user = await User.findUserByCredentials(username, password)
        const token = await user.generateAuthToken()
        return res.status(200).send({user: { _id: user._id, first_name: user.first_name }, token})
    } catch(err){
        return res.status(400).send({ error: err.message })
    }
}

const editUser = async (req, res, next) => {
    const allowedUpdates = ['username', 'first_name', 'last_name', 'email']
    const receivedFields = Object.keys(req.body)
    const isvalid = receivedFields.every(field => allowedUpdates.includes(field))
    if(!isvalid) return res.status(400).send({ error: 'invalid field sent'})
    receivedFields.forEach(field => {
        req.user[field] = req.body[field]
    })
    try{
        await req.user.save()
        return res.status(200).send(req.user)
    } catch(err){
        return res.status(500).send({ error: err.message })
    }
}
const userProfile = async(req, res, next) => {
    return res.status(200).send({
        _id: req.user._id,
        username: req.user.username, 
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email
    })
}

const resetPassword = async (req, res, next) => {
    const {oldPassword, newPassword, confirmPassword} = req.body 
    try{
        if(newPassword !== confirmPassword) return res.status(400).send({error: 'both passwords must match'})
        const ismatch = await bcrypt.compare(oldPassword, req.user.password)
        if(!ismatch) return res.status(400).send({error: 'unable to reset password'})
        const hashed = await bcrypt.hash(newPassword, 12) 
        const user = await User.findByIdAndUpdate({_id: req.user._id}, {password: hashed}, {new: true})
        return res.status(200).send(user)
    } catch(err){
        return res.status(500).send({ error: err.message })
    }
}

module.exports = { signUser, loginUser, editUser, resetPassword, userProfile}