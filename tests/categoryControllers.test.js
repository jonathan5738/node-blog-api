const request = require('supertest') 
const jwt = require('jsonwebtoken')
const app = require('../app') 
const User = require('../models/user') 
const Category = require('../models/category')
const mongoose = require('mongoose') 
const userId = new mongoose.Types.ObjectId()
const userTest = {
    username: 'alice123', 
    first_name: 'alice',
    last_name: 'smith',
    email: 'alice@gmail.com',
    password: '098alice@#'
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
    process.env['ADMIN_ID'] = String(userId)
})

afterAll(async () => {
    await Category.deleteMany()
})

describe('createCategory()', () => {
    test('should return 500 if unauthenticated user access route', async () => {
        await request(app).post('/categories/new').send({}).expect(500)
    })
    test('should return 403 if unauthorized user access route', async () => {
        await request(app).post('/categories/new')
        .set('Authorization', `Bearer ${token2}`)
        .send({name: 'fashion'}).expect(403)
    })
    test('should return 400 status code if invalid data is sent', async () => {
        await request(app).post('/categories/new')
        .set('Authorization', `Bearer ${token}`)
        .send({title: 'this'}).expect(400)
    })
    test('should return 201 status code and category data if valid data is sent', async () => {
        await request(app).post('/categories/new')
              .set('Authorization', `Bearer ${token}`)
              .send({name: 'programming'}).expect(201)
    })
})

describe('listCategory()', () => {
    test('should return 200 status code if request is succeed', async () => {
        await request(app).get('/categories/all').expect(200)
    })
    test('should return list of categories if request is successfull', async () => {
        const response = await request(app).get('/categories/all').expect(200)
        expect(response.body).toEqual(expect.any(Array))
    })
})

describe('editCategory()', () => {
    test('should return 500 if unauthenticated user access this route', async() => {
        await request(app).patch(`/categories/${categoryId}/edit`).send({}).expect(500)
    })
    test('should return 403 if unauthorized user access this route', async () => {
        await request(app).patch(`/categories/${categoryId}/edit`)
             .set('Authorization', `Bearer ${token2}`)
             .send({}).expect(403)
    })
    test('should return 200 status code and modified category if authorized user send valid data', async() => {
        const response = await request(app).patch(`/categories/${categoryId}/edit`)
             .set('Authorization', `Bearer ${token}`)
             .send({name: categoryTest.name.toUpperCase()}).expect(200)
             expect(response.body).toMatchObject({
                name: categoryTest.name.toUpperCase()
            })
    })
    test('should save category to the database after modification', async () => {
        await request(app).patch(`/categories/${categoryId}/edit`)
             .set('Authorization', `Bearer ${token}`)
             .send({name: categoryTest.name.toUpperCase() + '123'}).expect(200)
        const category = await Category.findOne({name: categoryTest.name.toUpperCase() + '123'})
        expect(category).not.toBeNull()
    })
})

describe('deleteCategory()', () => {
    test('should return 500 if unauthenticated user access this route', async() => {
        await request(app).delete(`/categories/${categoryId}/delete`).send({}).expect(500)
    })
    test('should return 403 if unauthorized user access this route', async () => {
        await request(app).delete(`/categories/${categoryId}/delete`)
             .set('Authorization', `Bearer ${token2}`)
             .send({}).expect(403)
    })
})