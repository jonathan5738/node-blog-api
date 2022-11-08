const mongoose = require('mongoose') 
const paragraphSchema = mongoose.Schema({
    subtitle: {type: String, required: true, trim: true},
    paragraph_img: {url: String, filename: String},
    content: {type: String, required: true, trim: true},
    post: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'}
}, { timestamps: true})

const Paragraph = mongoose.model('Paragraph', paragraphSchema) 
module.exports = Paragraph 
