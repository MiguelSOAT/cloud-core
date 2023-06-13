import request from 'supertest'
import app from '../../../../src/index'

describe('Test authenticated', () => {
    it ('Should redirect if not authenticated', async ()=> {
        const response = await request(app)
            .get('/v1/authenticate')
            .send()

        expect(response.status).toBe(302)
        expect(response.header.location).toBe('/login')
    })
});