if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const express = require('express') 
require('./db/mongoose')
const app = express() 
const PORT = process.env.PORT || 5000 
const cors = require('cors') 

const userRoutes = require('./routes/userRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const blogGroupRoutes = require('./routes/blogGroupRoutes')
const postRoutes = require('./routes/postRoutes')
const commentRoutes = require('./routes/commentRoutes')
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/accounts', userRoutes)
app.use('/categories', categoryRoutes)
app.use('/blogs', blogGroupRoutes)
app.use('/blogs/:blog_id/posts', postRoutes)
app.use('/blogs/:blog_id/posts/:post_id/comments', commentRoutes)

app.listen(PORT, () => console.log('server is running on port %s', PORT))