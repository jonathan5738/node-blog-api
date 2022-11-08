const express = require('express') 
const router = express.Router() 
const { createCategory, listCategory, editCategory, deleteCategory} = require('../controllers/categoryControllers')
const isLoggedIn = require('../middlewares/isLoggedIn')
const checkAdmin = require('../middlewares/checkAdmin') 

router.post('/new', isLoggedIn, checkAdmin, createCategory)
router.get('/all', listCategory)
router.patch('/:category_id/edit', isLoggedIn, checkAdmin, editCategory)
router.delete('/:category_id/delete', isLoggedIn, checkAdmin, deleteCategory)
module.exports = router