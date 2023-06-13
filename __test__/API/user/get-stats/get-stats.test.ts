import request from 'supertest'
import app from '../../../../src/index'
import * as uuid from 'uuid'
import { before } from 'node:test'
import MongoDBConnection from '../../../../src/infrastructure/mongodb-connection'

const fileMongo = {
  userId: 123120023,
  fileId: 1112312311,
  fileName: 'fake-file-name',
  fileSize: 1000,
  fileType: 'fake-file-type',
  fileExtension: 'fake-file-extension',
  uuid: 'fake-uuid',
  size: 1,
  origin: 'telegram',
  originalSize: 1000
}

beforeAll(async () => {
    const mongoClient = new MongoDBConnection()
    const db = await mongoClient.connect()
    await db.collection('files').insertOne(fileMongo)
    await mongoClient.disconnect()
})

describe('Test GetStats', () => {
    const username = uuid.v4().slice(0, 10)
    const password = uuid.v4().slice(0, 10)

    it ('Should success', async ()=> {
        expect(1).toBe(0)
        // const login = await request(app)
        //     .post('/v1/signup')
        //     .send({
        //         username: username,
        //         password: password,
        //     })
        // const cookie = login.header['set-cookie'][1]

        // const response = await request(app)
        //     .get('/user/stats')
        //     .set('Cookie', cookie)
        //     .send()
        
        // console.log(response.body)

        // expect(responseLogout.status).toBe(302)
        // expect(responseLogout.header['location']).toBe('/login')
    })
});