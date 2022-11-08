const Post = require('../models/post') 
const isPostAuthor = async (req, res, next) => {
    const {post_id} = req.params 
    try{
        const post = await Post.findOne({_id: post_id, author: req.user._id})
        if(!post) res.status(403).send({error: 'unauthorized action'})
        next()
    } catch(err){
        return res.status(500).send({error: 'unauthorized action'})
    }
}
module.exports = isPostAuthor