const BlogGroup = require('../models/blogGroup')
const isAuthor = async(req, res, next) => {
    const { blog_id } = req.params 
    try{
        const blogGroup = await BlogGroup.findOne({'_id': blog_id, 'authors': req.user._id})
        if(!blogGroup) return res.status(403).send({ error: 'unauthorized action'})
        next()
    } catch(err){
        return res.status(500).send({error: 'unauthorized action'})
    }
}
module.exports = isAuthor