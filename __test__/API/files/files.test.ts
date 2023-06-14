import request from 'supertest'
import app from '../../../src/index'
import * as uuid from 'uuid'
import fs from 'fs'
let cookie: string

beforeAll(async () => {
    const username = uuid.v4().slice(0, 10)
    const password = uuid.v4().slice(0, 10)

    await request(app)
    .post('/v1/signup')
    .send({
        username: username,
        password: password,
    })

    const response = await request(app)
        .post(`/v1/login/password?username=${username}&password=${password}`)
        .send()
    cookie = response.header['set-cookie'][0]
})


describe('Test PostFiles', () => {
    it ('Should PostFiles', async ()=> {

        const filePath = '__test__/resources/upload-test.png';

        const response = await request(app)
            .post('/v1/files')
            .set('Cookie', cookie)
            .attach('files', filePath)

        expect(response.status).toBe(200)
    })

});

describe('Test GetFiles', () => {
    it ('Should success', async ()=> {

        const response = await request(app)
            .get('/v1/files')
            .set('Cookie', cookie)
            .send()

        expect(response.status).toBe(200)
        expect(response.body.images).toBeDefined()
        expect(response.body.images.length).toBeGreaterThan(0)
    })

});