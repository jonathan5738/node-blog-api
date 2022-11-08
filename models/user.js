const mongoose = require('mongoose') 
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userSchema = mongoose.Schema({
    username: {type: String, required: true, trim: true},
    first_name: {type: String, required: true, trim: true},
    last_name: {type: String, required: true, trim: true},
    email: {type: String, required: true, validate(value){
        if(!validator.isEmail(value)) throw new Error('invalid email')
    }},
    password: { type: String, required: true, trim: true },
    googleId: { type: String },
    password: { type: String, required: true, trim: true}
}, {
    timestamps: true
})
userSchema.pre('save', async function(){
    const user = this 
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 12)
    }
})
userSchema.virtual('groups', {
    ref: 'BlogGroup',
    localField: '_id',
    foreignField: 'admin'
})
userSchema.statics.findUserByCredentials = async (username, password) => {
    const user = await User.findOne({username})
    if(!user) throw new Error('username or password invalid')
    const ismatch = await bcrypt.compare(password, user.password)
    if(!ismatch) throw new Error('username or password invalid')
    return user
}
userSchema.methods.generateAuthToken = async function(){
    const user = this 
    const token = jwt.sign({_id: user._id.toString(), oauth: true}, process.env.JWT_SECRET, {expiresIn: '6d'})
    return token 
}
const User = mongoose.model('User', userSchema) 
module.exports = User