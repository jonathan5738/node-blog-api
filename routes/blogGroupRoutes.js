const express = require('express') 
const router = express.Router() 
const { createBlogGroup, blogDetail, editBlogGroup, deleteBlogGroup,
     listBlogGroup, listBlogGroupsPrivate, joinBlogGroup, listAllPosts,
      listGroupByRegex, blogDetailPrivate, assignAuthorPermission,
       listGroupJoined, topFiveGroups, listBlogGroupPrivateCount,
      allPostCount, allGroupCount,
       removeAuthorPermission } = require('../controllers/blogGroupControllers')
const isLoggedIn = require('../middlewares/isLoggedIn')
const isGroupAdmin = require('../middlewares/isGroupAdmin') 
const multer = require('multer')
const {storage} = require('../services/cloudinary')
const config = multer({storage})



router.get('/all', listBlogGroup)
router.post('/new', config.single('blog_img'), isLoggedIn, createBlogGroup)
router.post('/join', isLoggedIn, joinBlogGroup)
router.get('/all/posts', listAllPosts)
router.post('/all/count', allGroupCount)
router.get('/all/posts/count', allPostCount)
router.get('/top/five', topFiveGroups)
router.post('/all/search', listGroupByRegex)


router.get('/private/all', isLoggedIn, listBlogGroupsPrivate)
router.post('/:blog_id/edit', config.single('blog_image'), isLoggedIn, isGroupAdmin, editBlogGroup)
router.get('/:blog_id/detail', blogDetail),
router.delete('/:blog_id/delete', isLoggedIn, isGroupAdmin, deleteBlogGroup)
router.get('/joined/groups/all', isLoggedIn, listGroupJoined)
router.get('/all/private/count',isLoggedIn, listBlogGroupPrivateCount)
router.get('/:blog_id/private/detail', isLoggedIn, isGroupAdmin, blogDetailPrivate)
router.post('/:blog_id/private/assign/permission', isLoggedIn, isGroupAdmin, assignAuthorPermission)
router.post('/:blog_id/private/remove/permission', isLoggedIn, isGroupAdmin, removeAuthorPermission)
module.exports = router