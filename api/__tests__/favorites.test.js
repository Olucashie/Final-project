const request = require('supertest')
const app = require('../app')
const mongoose = require('mongoose')

let token
let aptId

beforeAll(async () => {
	process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/test_db'
	await mongoose.connect(process.env.MONGO_URI)
	await request(app).post('/api/auth/register').send({ name: 'User', email: 'user@example.com', password: 'secret123' })
	const login = await request(app).post('/api/auth/login').send({ email: 'user@example.com', password: 'secret123' })
	token = login.body.token
	const created = await request(app).post('/api/apartments').set('Authorization', `Bearer ${token}`).send({ title: 'Fav Apt', description: 'Nice', price: 1500, location: 'City', bedrooms: 1, bathrooms: 1, amenities: ['WiFi'], images: [] })
	aptId = created.body._id
});

afterAll(async () => {
	await mongoose.connection.dropDatabase()
	await mongoose.connection.close()
})

describe('Favorites', () => {
	it('adds favorite', async () => {
		const res = await request(app).post('/api/favorites/add').set('Authorization', `Bearer ${token}`).send({ apartmentId: aptId })
		expect(res.status).toBe(200)
	})

	it('gets favorites list', async () => {
		const res = await request(app).get('/api/favorites').set('Authorization', `Bearer ${token}`)
		expect(res.status).toBe(200)
		expect(Array.isArray(res.body)).toBe(true)
	})

	it('removes favorite', async () => {
		const res = await request(app).post('/api/favorites/remove').set('Authorization', `Bearer ${token}`).send({ apartmentId: aptId })
		expect(res.status).toBe(200)
	})
})
