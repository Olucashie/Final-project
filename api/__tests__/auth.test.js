const request = require('supertest')
const app = require('../app')
const mongoose = require('mongoose')

beforeAll(async () => {
	process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/test_db'
	await mongoose.connect(process.env.MONGO_URI)
})

afterAll(async () => {
	await mongoose.connection.dropDatabase()
	await mongoose.connection.close()
})

describe('Auth', () => {
	it('registers a user and returns token', async () => {
		const res = await request(app).post('/api/auth/register').send({ name: 'Test', email: 'test@example.com', password: 'secret123' })
		expect(res.status).toBe(201)
		expect(res.body).toHaveProperty('token')
	})

	it('logs in an existing user', async () => {
		const res = await request(app).post('/api/auth/login').send({ email: 'test@example.com', password: 'secret123' })
		expect(res.status).toBe(200)
		expect(res.body).toHaveProperty('token')
	})
})
