const Post = require('../models/post') 
const BlogGroup = require('../models/blogGroup') 
const Paragraph = require('../models/paragraph')

const createPost = async (req, res, next) => {
    const { title, introduction } = req.body
    const { blog_id } = req.params
    try{
        const group = await BlogGroup.findById({_id: blog_id})
        let post = null 
        if(req.file){
           post = await Post.create({title, introduction,
                post_img: {url: req.file.path, filename: req.file.filename}, 
                author: req.user._id,  group: group._id}
           )
        } else {
            post = await Post.create({title, introduction, 
                author: req.user._id,  group: group._id})
        }
        return res.status(201).send(post)
    } catch(err){
        return res.status(400).send({ error: err.message })
    }
}

const listPosts = async (req, res, next) => {
    const {blog_id} = req.params 
    try{
        let posts = await Post.find({group: blog_id}).populate('author', {'username': 1})
        function quick_sort(arr){
            if(arr.length < 2) return arr 
            let index = Math.floor(Math.random() * arr.length)
            let pivot = arr[index]
            let less = []; let greater = []
            let equal = []
            for(let item of arr){
                if(String(item._id) === String(pivot._id)) continue 
                if(item.likes.length === pivot.likes.length) equal.push(item)
                if(item.likes.length < pivot.likes.length) less.push(item)
                if(item.likes.length > pivot.likes.length) greater.push(item)
            }
            return [...quick_sort(less), pivot, ...equal, ...quick_sort(greater)]
        }
        posts = quick_sort(posts).reverse()
        console.log(posts.length)
        return res.status(200).send(posts)
    } catch(err){
        return res.status(500).send({error: 'unable to find posts'})
    }
}


const authorPosts = async (req, res, next) => {
    const { blog_id } = req.params 
    try{
        const posts = await Post.find({group: blog_id, author: req.user._id})
        return res.status(200).send(posts)
    } catch(err){
        return res.status(500).send({error: 'unable fetch author\'s posts'})
    }
}

const postDetail = async (req, res, next) => {
    const { blog_id, post_id } = req.params 
    try{
        let post = await Post.findById({_id: post_id}).populate('author', {'username': 1}).populate('group', {'name': 1})
        const paragraphs = await Paragraph.find({post: post._id})
        return res.status(200).send({post, paragraphs})
    } catch(err){
        return res.status(400).send({ error: err.message })
    }
}

const postDetailPrivate = async (req, res, next) => {
    const { post_id} = req.params 
    try{
        const post = await Post.findById({_id: post_id, author: req.user._id})
        if(!post) return res.status(404).send({error: 'post not found'})
        const paragraphs = await Paragraph.find({post: post._id})
        return res.status(200).send({post, paragraphs})
    } catch(err){
        return res.status(500).send({ error: err.message })
    }
}

const likePost = async (req, res, next) => {
    const { post_id } = req.params 
    try{
        let post = await Post.findByIdAndUpdate({_id: post_id}, {"$addToSet": {likes: req.user._id}})
        if(post.dislikes.includes(req.user._id)){
             post.dislikes = post.dislikes.filter(dislike => dislike !== String(req.user._id))
             await post.save()
        }
        post = await Post.findById({_id: post_id})
                         .populate('author', {'username': 1}).populate('group', {'name': 1})
        const paragraphs = await Paragraph.find({post: post._id})
        return res.status(200).send({post, paragraphs})
    } catch(err){
        return res.status(500).send({ error: err.message })
    }
}

const dislikePost = async (req, res, next) => {
    const {post_id} = req.params 
    try{
        let post = await Post.findByIdAndUpdate({_id: post_id}, {"$addToSet": {dislikes: req.user._id}})
        if(post.likes.includes(req.user._id)){
            post.likes = post.likes.filter(like => like !== String(req.user._id))
            await post.save()
        }
        post = await Post.findById({_id: post._id})
                         .populate('author', {'username': 1}).populate('group', {'name': 1})
        const paragraphs = await Paragraph.find({post: post._id})
        return res.status(200).send({post, paragraphs})
    } catch(err){
        return res.status(500).send({ error: err.message })
    }
}

const addParagraph = async (req, res, next) => {
     const {post_id} = req.params 
     const {subtitle, content} = req.body
     try{
        const post = await Post.findById({_id: post_id})
        if(!post) return res.status(404).send({error: 'post not found'})
        let paragraph = null
        if(req.file){
            paragraph = await Paragraph.create({subtitle, content, 
            paragraph_img: {url: req.file.path, filename: req.file.filename}, post: post._id})
        } else {
           paragraph = await Paragraph.create({subtitle, content, post: post._id})
        }
        const paragraphs = await Paragraph.find({post: post._id})
        return res.status(201).send({post, paragraphs})
     } catch(err){
        return res.status(400).send({error: err.message })
     }
}

const editParagraph = async (req, res, next) => {
    const { post_id } = req.params 
    const { paragraph_id } = req.body
    try{
        const allowedFields = ['subtitle', 'content', 'paragraph_id']
        const receivedFields = Object.keys(req.body).filter(field => field !== 'paragraph_id')
        const isvalid = receivedFields.every(field => allowedFields.includes(field))
        if(!isvalid) return res.status(400).send({error: 'invalid field sent'})
        let paragraph = await Paragraph.findOne({_id: paragraph_id, post: post_id})
        receivedFields.forEach(field => {
            paragraph[field] = req.body[field]
        })
        if(req.file){
            paragraph.paragraph_img = {url: req.file.path, filename: req.file.filename}
        }
        await paragraph.save()
        const post = await Post.findById({_id: post_id})
        const paragraphs = await Paragraph.find({post: post._id})
        return res.status(200).send({ post, paragraphs })
    } catch(err){
        return res.status(500).send({error: err.message })
    }
}

const deleteParagraph = async (req, res, next) => {
    const {post_id} = req.params 
    const { paragraph_id } = req.body 
    try{
        await Paragraph.findOneAndDelete({_id: paragraph_id, post: post_id})
        let post = await Post.findById({_id: post_id})
        const paragraphs = await Paragraph.find({post: post._id})
        return res.status(200).send({post, paragraphs})
    } catch(err){
        return res.status(500).send({ error: err.message })
    }
}

const editPost = async (req, res, next) => {
    const allowedUpdates = ['title', 'introduction']
    const {blog_id, post_id} = req.params
    const receivedFields = Object.keys(req.body)
    const isvalid = receivedFields.every(field => allowedUpdates.includes(field))
    if(!isvalid) return res.status(404).send({error: 'invalid field sent'})
    const post = await Post.findById({_id: post_id})
    if(!post) return res.status(404).send({error: 'post not found'})
    receivedFields.forEach(field => {
        post[field] = req.body[field]
    })
    if(req.file){
        post['post_img'] = {url: req.file.path, filename: req.file.filename}
    }
    try{
        await post.save()
        const paragraphs = await Paragraph.find({post: post._id})
        return res.status(200).send({post, paragraphs})
    } catch(err){
        return res.status(500).send({error: err.message})
    }
}

const deletePost = async (req, res, next) => {
    const {blog_id, post_id} = req.params 
    try{
        await Post.findByIdAndDelete({_id: post_id})
        return res.status(200).send()
    } catch(err){
        return res.status(500).send({error: err.message })
    }
}
module.exports = { createPost, editPost, listPosts,
     addParagraph, postDetail, deletePost, editParagraph,
      deleteParagraph, postDetailPrivate, authorPosts, likePost, dislikePost }