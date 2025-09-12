const request = require('supertest')
const app = require('../app')
const mongoose = require('mongoose')

let token
let createdId

beforeAll(async () => {
	process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/test_db'
	await mongoose.connect(process.env.MONGO_URI)
	await request(app).post('/api/auth/register').send({ name: 'Admin', email: 'admin@example.com', password: 'secret123' })
	const login = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'secret123' })
	token = login.body.token
})

afterAll(async () => {
	await mongoose.connection.dropDatabase()
	await mongoose.connection.close()
})

describe('Apartments', () => {
	it('creates an apartment', async () => {
		const res = await request(app)
			.post('/api/apartments')
			.set('Authorization', `Bearer ${token}`)
			.send({ title: 'Test Apt', description: 'Nice', price: 1000, location: 'City', bedrooms: 1, bathrooms: 1, amenities: ['WiFi'], images: [] })
		expect(res.status).toBe(201)
		createdId = res.body._id
	})

	it('gets all apartments', async () => {
		const res = await request(app).get('/api/apartments')
		expect(res.status).toBe(200)
		expect(Array.isArray(res.body)).toBe(true)
	})

	it('searches apartments', async () => {
		const res = await request(app).get('/api/apartments/search?location=City&minPrice=500&bedrooms=1')
		expect(res.status).toBe(200)
	})

	it('gets by id', async () => {
		const res = await request(app).get(`/api/apartments/${createdId}`)
		expect(res.status).toBe(200)
	})

	it('updates apartment', async () => {
		const res = await request(app)
			.put(`/api/apartments/${createdId}`)
			.set('Authorization', `Bearer ${token}`)
			.send({ price: 1200 })
		expect(res.status).toBe(200)
		expect(res.body.price).toBe(1200)
	})

	it('deletes apartment', async () => {
		const res = await request(app)
			.delete(`/api/apartments/${createdId}`)
			.set('Authorization', `Bearer ${token}`)
		expect(res.status).toBe(200)
	})
})
