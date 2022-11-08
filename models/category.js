const mongoose = require('mongoose') 
const categorySchema = mongoose.Schema({
    name: {type: String, trim: true, required: true, unique: true}
})
categorySchema.virtual('groups', {
    ref: 'BlogGroup',
    localField: '_id',
    foreignField: 'category'
})
const Category = mongoose.model('Category', categorySchema) 
module.exports = Category