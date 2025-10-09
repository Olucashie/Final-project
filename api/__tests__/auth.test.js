const request = require('supertest')
const app = require('../app')
const mongoose = require('mongoose')
const User = require('../models/User')

beforeAll(async () => {
	process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/test_db'
	await mongoose.connect(process.env.MONGO_URI)
})

afterAll(async () => {
	await mongoose.connection.dropDatabase()
	await mongoose.connection.close()
})

describe('Auth', () => {
	it('register -> verify -> login flow', async () => {
		const email = 'test@example.com'
		const password = 'secret123'

		// Register
		const reg = await request(app).post('/api/auth/register').send({ name: 'Test', email, password })
		expect(reg.status).toBe(201)

		// Read token from DB (the server stores it)
		const user = await User.findOne({ email })
		expect(user).toBeTruthy()
		expect(user.emailVerificationToken).toBeTruthy()

		// Verify using token
		const verify = await request(app).post('/api/auth/verify-email').send({ email, token: user.emailVerificationToken })
		expect(verify.status).toBe(200)

		// Now login
		const login = await request(app).post('/api/auth/login').send({ email, password })
		expect(login.status).toBe(200)
		expect(login.body).toHaveProperty('token')
	})
})
