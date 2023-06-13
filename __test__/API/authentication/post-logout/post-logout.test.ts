import request from 'supertest'
import app from '../../../../src/index'
import * as uuid from 'uuid'

describe('Test logout', () => {
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
        
        const cookie = response.header['set-cookie'][0]
        
        const responseLogout = await request(app)
            .post('/v1/logout')
            .set('Cookie', cookie)
            .send()

        expect(responseLogout.status).toBe(302)
        expect(responseLogout.header['location']).toBe('/login')
    })
});