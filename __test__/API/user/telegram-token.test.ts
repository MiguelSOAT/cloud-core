import request from 'supertest'
import app from '../../../src/index'
import * as uuid from 'uuid'
import { after, before } from 'node:test';
import MongoDBConnection from '../../../src/infrastructure/mongodb-connection';


const telegramId = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000)
const securityToken = uuid.v4().slice(0, 10)

const telegramIdExpired = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000)
const securityTokenExpired = uuid.v4().slice(0, 10)

const mongoDocument = {
  "telegramId": telegramId,
  "expirationDate": "2025-06-02T10:52:02.399Z",
  "securityToken": securityToken,
}

const mongoDocumentExpired = {
  "telegramId": telegramIdExpired,
  "expirationDate": "2021-06-02T10:52:02.399Z",
  "securityToken": securityTokenExpired,
}
let cookie: string
beforeAll(async () => {
    const mongoClient = new MongoDBConnection()
    const db = await mongoClient.connect()
    await db.collection('credentials').insertMany([
        mongoDocument,
        mongoDocumentExpired
    ])
    await mongoClient.disconnect()

    
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


describe('Test PostTelegramToken', () => {
    it ('Should return error if credentials are expired', async ()=> {
        const responsePostTelegramToken = await request(app)
            .post('/v1/user/telegram')
            .set('Cookie', cookie)
            .send({
                telegramId: telegramIdExpired,
                securityToken: securityTokenExpired
            })

        expect(responsePostTelegramToken.status).toBe(200)
        expect(responsePostTelegramToken.body.ok).toBe(false)
        expect(responsePostTelegramToken.body.message).toBe('Please, request a new token in your telegram bot. Your token is expired')
    })

    it ('Should return error if credentials are empty', async ()=> {
        const responsePostTelegramToken = await request(app)
            .post('/v1/user/telegram')
            .set('Cookie', cookie)
            .send({})

        expect(responsePostTelegramToken.status).toBe(200)
        expect(responsePostTelegramToken.body.ok).toBe(false)
        expect(responsePostTelegramToken.body.message).toBe('Invalid credentials')
    })

    it ('Should success', async ()=> {
        const responsePostTelegramToken = await request(app)
            .post('/v1/user/telegram')
            .set('Cookie', cookie)
            .send({
                telegramId: telegramId,
                securityToken: securityToken
            })

        expect(responsePostTelegramToken.status).toBe(200)
        expect(responsePostTelegramToken.body.ok).toBe(true)
        expect(responsePostTelegramToken.body.message).toBe('Valid credentials')
    })

    it ('Should fail because telegram account already linked', async ()=> {
        const responsePostTelegramToken = await request(app)
            .post('/v1/user/telegram')
            .set('Cookie', cookie)
            .send({
                telegramId: telegramId,
                securityToken: securityToken
            })

        expect(responsePostTelegramToken.status).toBe(200)
        expect(responsePostTelegramToken.body.ok).toBe(false)
        expect(responsePostTelegramToken.body.message).toBe('This telegram account is already linked to another user')
    })
});

describe('Test GetTelegramToken', () => {
    it ('Should success', async ()=> {
        const responsePostTelegramToken = await request(app)
            .get('/v1/user/telegram')
            .set('Cookie', cookie)
            .send()

        expect(responsePostTelegramToken.status).toBe(200)
        expect(responsePostTelegramToken.body.telegramId).toBe(telegramId)
        expect(responsePostTelegramToken.body.securityToken).toBe(securityToken)
    })
})

describe('Test DeleteTelegramToken', () => {
    it ('Should success', async ()=> {
        const responsePostTelegramToken = await request(app)
            .delete('/v1/user/telegram')
            .set('Cookie', cookie)
            .send()

        expect(responsePostTelegramToken.status).toBe(200)
    })
})