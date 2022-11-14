const request = require('supertest') 
const jwt = require('jsonwebtoken')
const app = require('../app') 
const User = require('../models/user') 
const Category = require('../models/category')
const BlogGroup = require('../models/blogGroup')
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
const blogGroupTest = {
    name: 'testing blog group',
    description: 'this is just a test',
    url: 'https://images.pexels.com/photos/4048775/pexels-photo-4048775.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    filename: 'filename'
}
const token = jwt.sign({_id: userId.toString()}, process.env.JWT_SECRET)
const userid2 = new mongoose.Types.ObjectId()
const userTest2 = {
    username: 'mark123', first_name: 'mark', last_name: 'doe',
    email: 'mark@gmail.com', password: '098mark@#',
}
const token2 = jwt.sign({_id: userid2.toString()}, process.env.JWT_SECRET)
const categoryTest = {
    name: 'category test'
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
        category: categoryId
    })
    process.env['ADMIN_ID'] = String(userId)
})
afterAll(async () => {
    await BlogGroup.deleteMany()
    await Category.deleteMany()
})
describe('createBlogGroup()', () => {
    test('should return 500 if unauthenticated user access this route', async () => {
        await request(app).post('/blogs/new').send({}).expect(500)
    })
    test('should return 400 status code if authenticated user send invalid data', async () => {
        await request(app).post('/blogs/new')
            .set('Authorization', `Bearer ${token}`)
            .send({}).expect(400)
    })
    test('should return 201 status code and save to database if bloggroup is successfully created', async () => {
        const data = {name: 'second testing group', description: 'still a test'}
        await request(app).post('/blogs/new')
            .set('Authorization', `Bearer ${token}`)
            .send({name: data.name, description: data.description, category_name: categoryTest.name}).expect(201)

        const blogGroup = await BlogGroup.findOne({name: data.name})
        expect(blogGroup).not.toBeNull()
    })
})

describe('blogDetail()', () => {
    test('should return 404 status code if invalid id is send and a blog is unable to be found', async () => {
        const blogGroupId = new mongoose.Types.ObjectId()
        await request(app).get(`/blogs/${blogGroupId}/detail`).expect(404)
    })

    test('should return 200 status code and blogGroup object if request is sucessfull', async () => {
        const response = await request(app).get(`/blogs/${blogGroupId}/detail`).expect(200)
        expect(response.body).toEqual(expect.any(Object))
    })
})

describe('blogDetailPrivate()', () => {
    test('should return 500 if unauthenticated user access this route', async () => {
        await request(app).get(`/blogs/${blogGroupId}/private/detail`).expect(500)
    })
    test('should return 403 if unauthorized user access this route', async () => {
        await request(app).get(`/blogs/${blogGroupId}/private/detail`)
            .set('Authorization', `Bearer ${token2}`)
            .expect(403)
    })
    test('should return 500 status code if invalid  bloggroup id is send and a blog is unable to be found', async () => {
        const blogGroupId = new mongoose.Types.ObjectId()
        await request(app).get(`/blogs/${blogGroupId}/private/detail`)
                .set('Authorization', `Bearer ${token}`)
                .expect(500)
    })
    test('should return 200 status code and blogGroup object if request is sucessfull', async () => {
        const response = await request(app).get(`/blogs/${blogGroupId}/private/detail`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
        expect(response.body).not.toBeNull()
        expect(response.body).toEqual(expect.any(Object))
    })
})


describe('listBlogGroup()', () => {
    test('should 200 status code if request is successfull', async () => {
        await request(app).get('/blogs/all').expect(200)
    })
    test('should return a list of objects if the request is successfull', async () => {
        const response = await request(app).get('/blogs/all').expect(200)
        expect(response.body).toEqual(expect.any(Array))
    })
})

describe('joinBlogGroup()', () => {
    test('should return 500 status code if unauthenticated user access this route', async () => {
        await request(app).post('/blogs/join').send({}).expect(500)
    })
    test('should return 400 status code if invalid data is sent', async () => {
        await request(app).post('/blogs/join')
            .set('Authorization', `Bearer ${token2}`)
            .send({}).expect(400)
    })
    test('should return 200 and array of bloggroups if the request is sucessfull', async () => {
        const data = {blog_id: blogGroupId, user_id: userid2,
             category_name: categoryTest.name}
        const response = await request(app).post('/blogs/join')
             .set('Authorization', `Bearer ${token2}`)
             .send(data).expect(200)
        expect(response.body).toEqual(expect.any(Array))
    })

    test('should add user id to members list in the joined group', async () => {
        const blogGroup = await BlogGroup.findById({_id: blogGroupId})  
        expect(blogGroup.members).toContainEqual(userid2)
    })
})

describe('assignAuthorPermission()', () => {
    test('should return 500 status code if unauthenticated user access this route', async () => {
        // /:blog_id/private/assign/permission
        await request(app).post(`/blogs/${blogGroupId}/private/assign/permission`).expect(500)
    })
    test('should return 403 status code if unauthorized user access this route', async () => {
        await request(app).post(`/blogs/${blogGroupId}/private/assign/permission`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(403)
    })
    test('should return 404 if user id is not part of the group\'s members array', async () => {
        const data = {user_id: new mongoose.Types.ObjectId()}
        await request(app).post(`/blogs/${blogGroupId}/private/assign/permission`)
        .set('Authorization', `Bearer ${token}`)
        .send(data).expect(404)
    })
    test('should return 200 and bloggroup back if request is sucessfull', async () => {
        await request(app).post(`/blogs/${blogGroupId}/private/assign/permission`)
        .set('Authorization', `Bearer ${token}`)
        .send({user_id: userid2}).expect(200)
    })
    test('should save the user id to the group\'s authors array', async () => {
        const blogGroup = await BlogGroup.findById({_id: blogGroupId})  
        expect(blogGroup.authors).toContainEqual(userid2)
    })
})

describe('removeAuthorPermission()', () => {
    test('should return 500 status code if unauthenticated user access this route', async () => {
        await request(app).post(`/blogs/${blogGroupId}/private/remove/permission`).expect(500)
    })
    test('should return 403 status code if unauthorized user access this route', async () => {
        await request(app).post(`/blogs/${blogGroupId}/private/remove/permission`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(403)
    })

    test('should return 404 if user id is not part of the group\'s members array', async () => {
        const data = {user_id: new mongoose.Types.ObjectId()}
        await request(app).post(`/blogs/${blogGroupId}/private/remove/permission`)
        .set('Authorization', `Bearer ${token}`)
        .send(data).expect(404)
    })
    test('should return 200 and bloggroup back if request is sucessfull', async () => {
        await request(app).post(`/blogs/${blogGroupId}/private/remove/permission`)
        .set('Authorization', `Bearer ${token}`)
        .send({user_id: userid2}).expect(200)
    })
    test('should remove the user id from group\'s authors array', async () => {
        const blogGroup = await BlogGroup.findById({_id: blogGroupId})  
        expect(blogGroup.authors).not.toContainEqual(userid2)
    })
})

describe('editBlogGroup()', () => {
    test('should return 500 status code if unauthenticated user access this route', async () => {
        await request(app).post(`/blogs/${blogGroupId}/edit`).expect(500)
    })
    test('should return 403 status code if unauthorized user access this route', async () => {
        await request(app).post(`/blogs/${blogGroupId}/edit`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(403)
    })
    test('should return 400 if authorized user send invalid data', async () => {
        await request(app).post(`/blogs/${blogGroupId}/edit`)
        .set('Authorization', `Bearer ${token}`)
        .send({age: 22})
        .expect(400)
    })
    test('should return 200 status code and modified bloggroup back', async () => {
        const response = await request(app).post(`/blogs/${blogGroupId}/edit`)
                .set('Authorization', `Bearer ${token}`)
                .send({description: 'this is the new description'})
                .expect(200)
        expect(response.body).toEqual(expect.any(Object))
    })
})

describe('deleteBlogGroup()', () => {
    test('should return 500 status code if unauthenticated user access this route', async () => {
        await request(app).delete(`/blogs/${blogGroupId}/delete`).expect(500)
    })
    test('should return 403 status code if unauthorized user access this route', async () => {
        await request(app).delete(`/blogs/${blogGroupId}/delete`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(403)
    })
})