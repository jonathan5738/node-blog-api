const mongoose = require('mongoose') 
const slugify = require('slugify')
const blogGroupSchema = mongoose.Schema({
    name: {type: String, required: true, trim: true},
    blog_img: {url: String, filename: String},
    slug: {type: String, trim: true},
    description: {type: String, required: true},
    admin: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    authors: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}], 
    members: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    category: {type: mongoose.Schema.Types.ObjectId, ref: 'Category'},
    blockedUsers: [String]
}, {
    timestamps: true
})
blogGroupSchema.pre('save', async function(){
    const user = this 
    user.slug = slugify(user.name)
})

const BlogGroup = mongoose.model('BlogGroup', blogGroupSchema) 
module.exports = BlogGroup 
