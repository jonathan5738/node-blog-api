const express = require('express') 
const router = express.Router({mergeParams: true}) 
const { createComment, listComments, likeComment, dislikeComment } = require('../controllers/commentControllers') 
const isLoggedIn = require('../middlewares/isLoggedIn')
const isMember = require('../middlewares/isMember')

router.post('/new', isLoggedIn, isMember, createComment)
router.get('/all', listComments)
router.get('/:comment_id/like', isLoggedIn, isMember, likeComment)
router.get('/:comment_id/dislike', isLoggedIn, isMember, dislikeComment)
module.exports = router