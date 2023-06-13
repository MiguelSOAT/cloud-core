import request from 'supertest'
import app from '../../../../src/index'
import * as uuid from 'uuid'
import { after } from 'node:test';

describe('Test login', () => {
    const username = uuid.v4().slice(0, 10)
    const password = uuid.v4().slice(0, 10)

    it ('Should success', async ()=> {
        await request(app)
            .post('/v1/signup')
            .send({
                username: username,
                password: password,
            })

        const response = await request(app)
            .post(`/v1/login/password?username=${username}&password=${password}`)
            .send()

        expect(response.status).toBe(200)
        expect(response.header['set-cookie'][0]).toContain('connect.sid')
    })

    it ('Should return error if user credentials doesnt match', async ()=> {
        const response = await request(app)
            .post(`/v1/login/password?username=${username}&password=fakepassword`)
            .send()

        expect(response.status).toBe(401)
    })
});