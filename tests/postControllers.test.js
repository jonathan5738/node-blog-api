const request = require('supertest') 
const jwt = require('jsonwebtoken')
const app = require('../app') 
const User = require('../models/user') 
const Category = require('../models/category')
const BlogGroup = require('../models/blogGroup')
const Post = require('../models/post')
const mongoose = require('mongoose') 
const userId = new mongoose.Types.ObjectId()
const userTest = {
    username: 'alice123', 
    first_name: 'alice',
    last_name: 'smith',
    email: 'alice@gmail.com',
    password: '098alice@#'
}
const blogGroupId = new mongoose.Types.ObjectId()
const postId = new mongoose.Types.ObjectId()
const blogGroupTest = {
    name: 'testing blog group',
    description: 'this is just a test',
    url: 'https://images.pexels.com/photos/4048775/pexels-photo-4048775.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    filename: 'filename'
}
const postTest = {
    title: 'another test post',
    introduction: 'test intro',
    post_img: {url: blogGroupTest.url, filename: blogGroupTest.filename}
}
const token = jwt.sign({_id: userId.toString()}, process.env.JWT_SECRET)
const userid2 = new mongoose.Types.ObjectId()
const userid3 = new mongoose.Types.ObjectId()
const userTest2 = {
    username: 'mark123', first_name: 'mark', last_name: 'doe',
    email: 'mark@gmail.com', password: '098mark@#',
}
const userTest3 = {
    username: 'mark1234', first_name: 'mark', last_name: 'doe',
    email: 'mark@gmail.com', password: '098mark@#',
}
const token2 = jwt.sign({_id: userid2.toString()}, process.env.JWT_SECRET)
const token3 = jwt.sign({_id: userid3.toString()}, process.env.JWT_SECRET)
const categoryTest = {
    name: 'new category'
}
const categoryId = new mongoose.Types.ObjectId()
beforeAll(async () => {
    await User.deleteMany()
    await Category.deleteMany()
    await BlogGroup.deleteMany()
    await User.create({
        _id: userId,
        username: userTest.username,
        first_name: userTest.first_name,
        last_name: userTest.last_name,
        email: userTest.email,
        password: userTest.password
    })
    // create second test user
    await User.create({
        _id: userid2,
        username: userTest2.username,
        first_name: userTest2.first_name,
        last_name: userTest2.last_name,
        email: userTest2.email,
        password: userTest2.password
    })

    await User.create({
        _id: userid3,
        username: userTest3.username,
        first_name: userTest3.first_name,
        last_name: userTest3.last_name,
        email: userTest3.email,
        password: userTest3.password
    })

    await Category.create({
        _id: categoryId,
        name: categoryTest.name,
    })
    await BlogGroup.create({
        _id: blogGroupId,
        name: blogGroupTest.name,
        description: blogGroupTest.description,
        admin: userId,
        blog_img: {url: blogGroupTest.url, filename: blogGroupTest.filename},
        category: categoryId,
        members: [userid2, userid3],
        authors: [userid2, userid3]
    })
    await Post.create({
        _id: postId,
        title: postTest.title,
        introduction: postTest.introduction,
        post_img: postTest.post_img,
        author: userid2,
        group: blogGroupId
    })
    process.env['ADMIN_ID'] = String(userId)
})

describe('createPost()', () => {
    test('should return 500 if unauthenticated user access this route', async () => {
        await request(app).post(`/blogs/${blogGroupId}/posts/new`).expect(500)
    })
    test('should return 403 if unauthorized user access this route', async () => {
        await request(app).post(`/blogs/${blogGroupId}/posts/new`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403)
    })
    test('should return 403 if blogGroupId is invalid and hence group unable to be found', async () => {
        const blogGroupId = new mongoose.Types.ObjectId()
        await request(app).post(`/blogs/${blogGroupId}/posts/new`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403)
    })
    test('should return 201 if authorized user send valid data', async () => {
        const data = {title: 'this is a test', introduction: 'test'}
        await request(app).post(`/blogs/${blogGroupId}/posts/new`)
        .set('Authorization', `Bearer ${token2}`)
        .send(data).expect(201)
    })
})

describe('listPosts()', () => {
    test('should return empty posts array if bloggroup id is invalid', async () => {
        const blogGroupId = new mongoose.Types.ObjectId()
        const response = await request(app).get(`/blogs/${blogGroupId}/posts/all`)
        expect(response.body.length).toEqual(0)
    })
    test('should return an array of created posts and 200 status code if blogGroup contains posts', async () => {
        const response = await request(app).get(`/blogs/${blogGroupId}/posts/all`)
                         .expect(200)
        expect(response.body).toEqual(expect.any(Array))
        expect(response.body.length).toBeGreaterThan(0)
    })
})

describe('listPostsByRegex()', () => {
    test('should return empty posts array if bloggroup id is invalid', async () => {
        const blogGroupId = new mongoose.Types.ObjectId()
        const response = await request(app).post(`/blogs/${blogGroupId}/posts/all/search`)
        expect(response.body.length).toEqual(0)
    })
    test('should return posts array if blogGroup id is valid without searchTerm', async () => {
        const response = await request(app).post(`/blogs/${blogGroupId}/posts/all/search`)
        expect(response.body).toEqual(expect.any(Array))
        expect(response.body.length).toBeGreaterThan(0)
    })
    test('should return posts based on searchTerm', async () => {
        const response = await request(app).post(`/blogs/${blogGroupId}/posts/all/search`, {searchTerm: 'this'})
        expect(response.body).toEqual(expect.any(Array))
        expect(response.body.length).toBeGreaterThan(0)
    })
})

describe('editPost()', () => {
    test('should return 500 if unauthenticated user access this route', async () => {
        await request(app).patch(`/blogs/${blogGroupId}/posts/${postId}/edit`).expect(500)
    })
    test('should return 403 if unauthorized user access this route', async () => {
        await request(app).patch(`/blogs/${blogGroupId}/posts/${postId}/edit`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403)
    })
    test('should return 404 if one author attempt to edit another\'s author post', async () => {
        await request(app).patch(`/blogs/${blogGroupId}/posts/${postId}/edit`)
        .set('Authorization', `Bearer ${token3}`)
        .expect(403)
    })
})