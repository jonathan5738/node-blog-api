if(process.env.NODE_ENV !== 'production') {
    process.env['NODE_ENV'] = 'development'
    require('dotenv').config({ path: `.${process.env.NODE_ENV}.env`})
}
const express = require('express') 
require('./db/mongoose')
const app = express() 
const cors = require('cors') 

const userRoutes = require('./routes/userRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const blogGroupRoutes = require('./routes/blogGroupRoutes')
const postRoutes = require('./routes/postRoutes')
const commentRoutes = require('./routes/commentRoutes')

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res, next) => {
    return res.status(200).send({message: 'blog api'})
})
app.use('/accounts', userRoutes)
app.use('/categories', categoryRoutes)
app.use('/blogs', blogGroupRoutes)
app.use('/blogs/:blog_id/posts', postRoutes)
app.use('/blogs/:blog_id/posts/:post_id/comments', commentRoutes)
module.exports = app