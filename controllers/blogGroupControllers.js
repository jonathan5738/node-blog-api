const BlogGroup = require('../models/blogGroup') 
const Category = require('../models/category')
const User = require('../models/user')
const Post = require('../models/post')



const createBlogGroup = async (req, res, next) => {
    const {name, description, category_name} = req.body
    try {
        const blog_img = {url: req?.file?.path, filename: req?.file?.filename}
        const category = await Category.findOne({name: category_name})
        if(req.file){
            await BlogGroup.create({name, description, admin: req.user._id, blog_img, category})
        } else {
            await BlogGroup.create({name, description, admin: req.user._id, category})
        }
        const user = await User.findById({_id: req.user._id}).populate('groups')
        let blogGroups = user.groups
        return res.status(201).send(blogGroups)
    } catch(err){
        return res.status(400).send({ error: err.message })
    }
}

const blogDetail = async (req, res, next) => {
    const { blog_id } = req.params 
    try {
         const blogGroup = await BlogGroup.findById({_id: blog_id})
         if(!blogGroup) return res.status(404).send({error: 'blog not found'})
         return res.status(200).send(blogGroup)
    } catch(err){
        return res.status(404).send({error: 'unable to find group'})
    }
}
const topFiveGroups = async (req, res, next) => {
    try {
        let blogGroups = await BlogGroup.find({}).populate('admin', {'first_name': 1, 'last_name': 1})
        function quick_sort(arr){
            if(arr.length < 2) return arr 
            let index = Math.floor(Math.random() * arr.length)
            let pivot = arr[index]
            let less = []; let greater = []
            let equal = []
            for(let item of arr){
                if(String(item._id) === String(pivot._id)) continue
                if(item.members.length === pivot.members.length) equal.push(item)
                if(item.members.length < pivot.members.length) less.push(item)
                if(item.members.length > pivot.members.length) greater.push(item)
            }
            return [...quick_sort(greater), pivot, ...equal, ...quick_sort(less)]
        }
        blogGroups = quick_sort(blogGroups).slice(0, 6)
        return res.status(200).send(blogGroups)
    } catch(err){
        return res.status(500).send({error: 'unable to fetch top five groups'})
    }
}

const allPostCount = async (req, res, next) => {
    try{
        const postCount = await Post.find({}).count()
        return res.status(200).send({postCount})
    } catch(err){
        return res.status(500).send({error: 'unable to fetch posts count'})
    }
}
const listAllPosts = async (req, res, next) => {
    let skipParam = req.query.skipParam 
    if(!skipParam) skipParam = 0
    try{
        let posts = await Post.find({}).limit(4).skip(skipParam).populate('author', {'username': 1})
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
            return [...quick_sort(greater), pivot, ...equal, ...quick_sort(less)]
        }
        posts = quick_sort(posts)
        return res.status(200).send(posts)
    } catch(err){
        return res.status(500).send({error: 'unable to find posts'})
    }
}

const blogDetailPrivate = async (req, res, next) => {
    const { blog_id } = req.params
    try{
        const blogGroup = await BlogGroup.findById({_id: blog_id})
             .populate('members', {'username': 1, 'first_name': 1, 'last_name': 1})
             .populate('authors', {'username': 1, 'first_name': 1, 'last_name': 1})
         return res.status(200).send(blogGroup)
    } catch(err){
        return res.status(404).send({error: 'unable to find group'})
    }
}

const listGroupJoined = async (req, res, next) => {
    const currentUser = req.user 
    try{
        const blogGroups = await BlogGroup.find({'members': currentUser._id})
        return res.status(200).send(blogGroups)
    } catch(err){
        return res.status(500).send({ error: err.message })
    }
}
const joinBlogGroup = async (req, res, next) => {
    const {blog_id, user_id, category_name} = req.body
    try{
        const user = await User.findById({_id: user_id})
        if(!user) return res.status(404).send({ error: 'user not found'})
        let blogGroup = await BlogGroup.findByIdAndUpdate({_id: blog_id}, {"$addToSet": {"members": user._id }}, {new: true})

        if(!blogGroup) return res.status(404).send({error: 'blog not found'})

        const category = await Category.findOne({name: category_name}).populate('groups')
        let blogGroups = category.groups
        return res.status(200).send(blogGroups)
    } catch(err){
        return res.status(400).send({ error: err.message })
    }
}

const assignAuthorPermission = async (req, res, next) => {
    const {blog_id} = req.params 
    const { user_id } = req.body
    try{
        let blogGroup = await BlogGroup.findById({_id: blog_id}).populate('members')
        const members = blogGroup.members
        const member = members.filter(member => member.id === user_id)[0]
        if(!member) return res.status(404).send({error: 'member not found'})
        blogGroup = await BlogGroup.findByIdAndUpdate({_id: blog_id}, {"$addToSet": {"authors": member._id }})
                        .populate('members').populate('authors', {'username': 1, 'first_name': 1, 'last_name': 1})
        return res.status(200).send(blogGroup)
    } catch(err){
        return res.status(500).send({ error: err.message })
    }
}

const removeAuthorPermission = async (req, res, next) => {
     const { blog_id } = req.params 
     const { user_id } = req.body 
     try{
        let blogGroup = await BlogGroup.findById({_id: blog_id}).populate('members')
        const members = blogGroup.members
        const member = members.filter(member => member.id === user_id)[0]
        if(!member) return res.status(404).send({error: 'member not found'})

        blogGroup = await BlogGroup.findByIdAndUpdate({_id: blog_id}, {"$pull": {"authors": member._id }})
                        .populate('members').populate('authors', {'username': 1, 'first_name': 1, 'last_name': 1})
        return res.status(200).send(blogGroup)
     } catch(err){
        return res.status(500).send({ error: err.message })
     }
}

const listGroupByRegex = async (req, res, next) => {
    const {searchTerm, category_name} = req.body
    let skipParam = req.query.skipParam 
    if(!skipParam) skipParam = 0
    try{
        const regex = new RegExp('^' + searchTerm + '')
        const category = await Category.findOne({name: category_name}).populate('groups')
        const blogGroups = await BlogGroup.find({name: {"$regex": regex, "$options": 'i'}, category}).limit(3).skip(skipParam)
        return res.status(200).send(blogGroups)
    } catch(err){
        return res.status(400).send({ error: err.message })
    }
}

const allGroupCount = async (req, res, next) => {
    const {searchTerm, category_name} = req.body
    try{
        const regex = new RegExp('^' + searchTerm + '')
        const category = await Category.findOne({name: category_name}).populate('groups')
        const blogGroupCount = await BlogGroup.find({name: {"$regex": regex, "$options": 'i'}, category}).count()
        return res.status(200).send(blogGroupCount)
    } catch(err){
        return res.status(500).send({ error: err.message })
    }
}


const listBlogGroup = async (req, res, next) => {
    const {category_name} = req.query
    let skipParam = req.query.skipParam 
    if(!skipParam) skipParam = 0
    try{
        let blogGroups
        if(!category_name){
            blogGroups = await BlogGroup.find({})
        } else {
            const category = await Category.findOne({name: category_name})
            blogGroups = await BlogGroup.find({category: category}).limit(3).skip(skipParam)
        }
        return res.status(200).send(blogGroups)
    } catch(err){
        return res.status(500).send({ error: err.message })
    }
}

const listBlogGroupsPrivate = async (req, res, next) => {
    let skipParam = req.query.skipParam 
    if(!skipParam) skipParam = 0
    try{
        let blogGroups = await BlogGroup.find({admin: req.user._id}).limit(3).skip(skipParam)
        return res.status(200).send(blogGroups)
    } catch(err){
        return res.status(500).send({ error: err.message })
    }
}
const listBlogGroupPrivateCount = async (req, res, next) => {
    try{
        const countCreatedBlogs = await BlogGroup.find({admin: req.user._id}).count()
        return res.status(200).send({countBlogGroup: countCreatedBlogs})
    } catch(err){
        return res.status(500).send({ error: err.message })
    }
}
const editBlogGroup = async (req, res, next) => {
    const { blog_id } = req.params
    const allowedUpdates = ['name', 'description']
    const receivedFields = Object.keys(req.body)
    const isvalid = receivedFields.every(field => allowedUpdates.includes(field))
    if(!isvalid) return res.status(400).send({error: 'invalid field sent'})
    try{
        let blogGroup = null
        if(req.file){
           blogGroup = await BlogGroup.findByIdAndUpdate({_id: blog_id }, {...req.body, blog_img: {url: req.file.path, filename: req.file.filename}}, {new: true})
        } else {
            blogGroup = await BlogGroup.findByIdAndUpdate({_id: blog_id }, {...req.body}, {new: true})
        }
        const user = await User.findById({_id: req.user._id}).populate('groups')
        return res.status(200).send(blogGroup)
    } catch(err){
        return res.status(500).send({ error: err.message })
    }
}

const deleteBlogGroup = async (req, res, next) => {
    const { blog_id } = req.params 
    try{
        await BlogGroup.findByIdAndDelete({_id: blog_id })
        return res.status(200).send({})
    } catch(err){
        return res.status(500).send({ error: err.message })
    }
}

module.exports = { 
     createBlogGroup, editBlogGroup, blogDetail, deleteBlogGroup,
     listBlogGroup, listBlogGroupsPrivate, joinBlogGroup, listGroupByRegex, listAllPosts,
     blogDetailPrivate, assignAuthorPermission,
      removeAuthorPermission, listGroupJoined, topFiveGroups, allPostCount, listBlogGroupPrivateCount,
      allGroupCount
 }