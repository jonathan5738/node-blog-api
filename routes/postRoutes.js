const express = require('express') 
const router = express.Router({ mergeParams: true }) 
const { createPost, listPosts, addParagraph,
     postDetail, editPost, deletePost, editParagraph,
      deleteParagraph, postDetailPrivate, authorPosts, likePost, dislikePost } = require('../controllers/postControllers')
const isLoggedIn = require('../middlewares/isLoggedIn')
const isAuthor = require('../middlewares/isAuthor')
const isPostAuthor = require('../middlewares/isPostAuthor')
const isMember = require('../middlewares/isMember')
const multer = require('multer')
const {storage} = require('../services/cloudinary')
const config = multer({storage})

router.post('/new', config.single('post_img'), isLoggedIn, isAuthor, createPost) 
router.get('/all', listPosts)
router.get('/private/all', isLoggedIn, isAuthor, authorPosts)
router.get('/:post_id/like', isLoggedIn, isMember, likePost)
router.get('/:post_id/dislike', isLoggedIn, isMember,dislikePost)
router.get('/:post_id/detail', postDetail)
router.patch('/:post_id/edit', config.single('post_image'), isLoggedIn, isAuthor, isPostAuthor, editPost)
router.delete('/:post_id/delete', isLoggedIn, isAuthor, isPostAuthor, deletePost)
router.get('/:post_id/private/detail', isLoggedIn, isAuthor, isPostAuthor, postDetailPrivate)


router.post('/:post_id/paragraph/add', config.single('paragraph_img'), isLoggedIn, isAuthor, isPostAuthor, addParagraph)
router.patch('/:post_id/paragraph/edit', config.single('paragraph_image'), isLoggedIn, isAuthor, isPostAuthor, editParagraph)
router.delete('/:post_id/paragraph/delete', isLoggedIn, isAuthor, isPostAuthor, deleteParagraph)
module.exports = router