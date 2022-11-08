const Comment = require('../models/comment') 
const Post = require('../models/post')
const createComment = async (req, res, next) => {
    const { post_id } = req.params
    const { title, content } = req.body
    try{
        const post = await Post.findById({_id: post_id})
        if(!post) return res.status(404).send({error: 'post not found'})
        await Comment.create({title, content, user: req.user._id, post: post._id, createAt: new Date().getTime()})
        const comments = await Comment.find({ post: post._id }).populate('user', {'username': 1})
        return res.status(201).send(comments)
    } catch(err){
        return res.status(400).send({ error: err.message })
    }
}
const listComments = async (req, res, next) => {
    const {post_id} = req.params 
    try{
        const post = await Post.findById({_id: post_id})
        const comments = await Comment.find({ post: post._id}).limit(5).sort({likes: -1}).populate('user', {'username': 1})
        return res.status(201).send(comments)
    } catch(err){
        return res.status(500).send({ error: err.message })
    }
}
const likeComment = async (req, res, next) => {
    const { comment_id, post_id } = req.params 
    try{
        let comment = await Comment.findByIdAndUpdate({_id: comment_id}, {"$addToSet": {likes: req.user._id}})
        if(comment.dislikes.includes(req.user._id)){
             comment.dislikes = comment.dislikes.filter(dislike => dislike !== String(req.user._id))
             await comment.save()
        }
        const comments = await Comment.find({ post: post_id}).limit(5).sort({likes: -1}).populate('user', {'username': 1})
        return res.status(201).send(comments)
    } catch(err){
        return res.status(500).send({ error: err.message })
    }
}
const dislikeComment = async (req, res, next) => {
    const { comment_id, post_id } = req.params 
    try{
        let comment = await Comment.findByIdAndUpdate({_id: comment_id}, {"$addToSet": {dislikes: req.user._id}})
        if(comment.likes.includes(req.user._id)){
             comment.likes = comment.likes.filter(like => like !== String(req.user._id))
             await comment.save()
        }
        const comments = await Comment.find({ post: post_id}).limit(5).sort({likes: -1}).populate('user', {'username': 1})
        return res.status(201).send(comments)
    } catch(err){
        return res.status(500).send({ error: err.message })
    }
}
module.exports = { createComment, listComments, likeComment, dislikeComment }