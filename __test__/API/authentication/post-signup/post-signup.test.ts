import request from 'supertest'
import app from '../../../../src/index'
import * as uuid from 'uuid'
import { after } from 'node:test';

describe('Test signup', () => {
    const username = uuid.v4().slice(0, 10)
    const password = uuid.v4().slice(0, 10)

    it ('Should success', async ()=> {
        const response = await request(app)
            .post('/v1/signup')
            .send({
                username: username,
                password: password,
            })

        expect(response.status).toBe(200)
    })

    it ('Should return error if user already exists', async ()=> {
                const response = await request(app)
            .post('/v1/signup')
            .send({
                username: username,
                password: password,
            })
            
        expect(response.status).toBe(500)
        expect(response.body.message).toBe('Username already exists')

    })
});