const BlogGroup = require('../models/blogGroup') 
const isGroupAdmin = async (req, res, next) => {
    const {blog_id} = req.params
    try{
        const blog = await BlogGroup.findById({_id: blog_id})
        if(!blog.admin._id.equals(req.user._id)){
            return res.status(403).send({error: 'unauthorized action'})
        }
        next()
    } catch(err){
        return res.status(500).send({error: 'unable to check permission'})
    }
}

module.exports = isGroupAdmin