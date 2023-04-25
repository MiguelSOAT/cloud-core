import { MongoClient } from 'mongodb'
import CustomLogger from './custom-logger'
import { Db } from 'mongodb'

export default class MongoDBConnection {
  public client: MongoClient
  constructor() {
    const user = process.env.MONGODB_USER
    const password = process.env.MONGODB_PASSWORD
    const host = process.env.MONGODB_HOST
    const port = process.env.MONGODB_PORT
    this.client = new MongoClient(
      `mongodb://${user}:${password}@${host}:${port}`
    )
  }

  public async connect(): Promise<Db> {
    CustomLogger.info('Connection to MongoDB')
    await this.client.connect()
    const db: Db = this.client.db(process.env.MONGODB_DB)
    CustomLogger.info('Connected to MongoDB')
    return db
  }

  public async disconnect(): Promise<void> {
    this.client.close()
    CustomLogger.info('Disconnected from MongoDB')
  }
}
