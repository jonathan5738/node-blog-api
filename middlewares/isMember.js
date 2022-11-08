const BlogGroup = require('../models/blogGroup') 
const isMember = async (req, res, next) => {
    const {blog_id, post_id} = req.params 
    try{
        const blogGroup = await BlogGroup.findById({_id: blog_id})
        if(!blogGroup.members.includes(req.user._id)) {
            return res.status(403).send({ error: 'authorized action'})
        }
        next()
    } catch(err){
        return res.status(500).send({ error: err.message })
    }
}
module.exports = isMember