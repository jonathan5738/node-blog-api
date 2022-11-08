const express = require('express') 
const router = express.Router() 
const { signUser, loginUser, editUser, resetPassword, userProfile } = require('../controllers/userControllers') 
const isLoggedIn = require('../middlewares/isLoggedIn')

router.post('/signin', signUser)
router.get('/profile', isLoggedIn, userProfile)
router.post('/login', loginUser)
router.patch('/edit', isLoggedIn, editUser)
router.patch('/reset/password', isLoggedIn, resetPassword)
module.exports = router