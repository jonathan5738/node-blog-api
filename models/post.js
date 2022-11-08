const mongoose = require('mongoose') 
const postSchema = mongoose.Schema({
    title: { type: String, required: true, trim: true},
    slug: { type: String },
    post_img: {url: String, filename: String},
    introduction: {type: String, required: true},
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    likes: [String],
    dislikes: [String],
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogGroup'}
})

const Post = mongoose.model('Post', postSchema)
module.exports = Post 
