const mongoose = require('mongoose') 
const commentSchema = mongoose.Schema({
    title: {type: String, required: true, trim: true},
    content: {type: String, required: true, trim: true},
    post: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'},
    likes: [String],
    dislikes: [String],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    createAt: {type: Number}
}) 

const Comment = mongoose.model('Comment', commentSchema) 
module.exports = Comment 
