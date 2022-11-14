const request = require('supertest') 
const jwt = require('jsonwebtoken')
const app = require('../app') 
const User = require('../models/user') 
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
beforeAll(async () => {
    await User.deleteMany()
    await User.create({
        _id: userId,
        username: userTest.username,
        first_name: userTest.first_name,
        last_name: userTest.last_name,
        email: userTest.email,
        password: userTest.password
    })
})
afterAll(async () => {
    await User.deleteMany()
})
describe('signUser()', () => {
    test('should return 400 if invalid is sent', async () => {
        await request(app).post('/accounts/signin').send({}).expect(400)
    })
    test('should return 201 status code and user object if valid is sent', async () => {
        const data = {
            username: 'jonathan123', first_name: 'john', last_name: 'smith', 
            email: 'john@gmail.com', password: '098jonathan123'
        }
        const response = await request(app).post('/accounts/signin').send(data).expect(201)
        expect(response.body.user._id).not.toBeNull()
    })
    test('should return a token if the user is successfully signed in', async () => {
        const data = {
            username: 'john123', first_name: 'john', last_name: 'smith', 
            email: 'john@gmail.com', password: '098jonathan123'
        }
        const response = await request(app).post('/accounts/signin').send(data).expect(201)
        expect(response.body.token).toBeDefined()
        expect(response.body.token).toEqual(expect.any(String))
        expect(response.body.token.length).toBeGreaterThan(0)
    })
    test('should save user in database if signed in is successful', async () => {
        const data = {
            username: 'john1234', first_name: 'john', last_name: 'smith', 
            email: 'john@gmail.com', password: '098jonathan123'
        }
        const response = await request(app).post('/accounts/signin').send(data).expect(201)
        const user = await User.findById({_id: response.body.user._id})
        expect(user).toBeDefined()
        expect(user).toMatchObject({
            username: data.username,
            first_name: data.first_name
        })
    })
})

describe('loginUser()', () => {
    test('should return 400 status code if invalid data is sent', async () => {
        await request(app).post('/accounts/login').send({}).expect(400)
    })
    test('should return 200 status code and object containing user data if data is sent', async () => {
        const response = await request(app).post('/accounts/login').send({
            username: userTest.username,
            password: userTest.password
        }).expect(200)
        expect(response.body.user).toBeDefined()
        expect(response.body.user).toMatchObject({
            first_name: userTest.first_name
        })
    })
})

describe('editUser()', () => {
    test('should return 500 if unauthenticated access route', async () => {
        await request(app).patch('/accounts/edit').send({}).expect(500)
    })
    test('should return 400 if invalid data is sent', async () => {
        await request(app).patch('/accounts/edit')
            .set('Authorization', `Bearer ${token}`)
            .send({age: 24}).expect(400)
    })
    test('should return 200 status code and object containing user data', async () => {
        const response = await request(app).patch('/accounts/edit')
            .set('Authorization', `Bearer ${token}`)
            .send({first_name: userTest.username.toUpperCase()}).expect(200)
        expect(response.body).toEqual(expect.any(Object))
        const user = await User.findOne({first_name: userTest.first_name.toUpperCase()})
        expect(user).toBeDefined()
    })
})

describe('resetPassword()', () => {
    test('should return 500 status code if unauthenticated user access route', async () => {
        await request(app).patch('/accounts/reset/password').send({}).expect(500)
    })
    test('should return 500 status code if invalid data is sent', async() => {
        await request(app).patch('/accounts/reset/password')
          .set('Authorization', `Bearer ${token}`)
          .send({age: 27}).expect(500)
    })
    test('should return 400 status code if both passwords don\'t match', async () => {
        await request(app).patch('/accounts/reset/password')
            .set('Authorization', `Bearer ${token}`)
            .send({oldPassword: userTest.password,
                 newPassword: 'newpassword',
                 confirmPassword: '098newpassword'
            }).expect(400)
    })
    test('should return 200 status code and user data if request succeed', async () => {
        const newPassword = 'newPassword'
        const response = await request(app).patch('/accounts/reset/password')
            .set('Authorization', `Bearer ${token}`)
            .send({oldPassword: userTest.password,
                newPassword,
                confirmPassword: newPassword
            }).expect(200)
        expect(response.body).toEqual(expect.any(Object))
        expect(response.body).toMatchObject({
            _id: userId,
            username: userTest.username,
        })
    })
})