import { IUser, IUserDBData } from './user'
import MYSQLDB from '../mysqldb/mysqldb.model'
import crypto from 'node:crypto'
import logger from '../../infrastructure/logger'
import jwt from 'jsonwebtoken'

export default class User
  extends MYSQLDB<IUserDBData>
  implements IUser
{
  id?: number
  username = 'No user created'
  hashedPassword?: string
  salt?: string

  table = 'USER'

  constructor(username?: string) {
    super()
    if (username) this.username = username
  }

  public getUsername(): string {
    return this.username
  }

  public async findByUsername(): Promise<IUserDBData | null> {
    const values = ['*']
    const conditions = ['username']
    const conditionsValues = [this.username]
    const dbData: IUserDBData[] | null = await super.select(
      this.table,
      values,
      conditions,
      conditionsValues
    )

    if (dbData) this.setUserDataFromDB(dbData)

    return dbData[0] || null
  }

  public async findById(
    id: number
  ): Promise<IUserDBData | null> {
    const values = ['*']
    const conditions = ['id']
    const conditionsValues = [id]
    const dbData: IUserDBData[] | null = await super.select(
      this.table,
      values,
      conditions,
      conditionsValues
    )

    if (dbData) this.setUserDataFromDB(dbData)

    return dbData[0] || null
  }

  private async insertNewAccount(): Promise<void> {
    if (!this.hashedPassword || !this.salt) {
      logger.error(
        `Couldn't intert user in DB. Password or salt not created.`
      )
      throw new Error('Password or salt not found')
    }

    const keys = ['username', 'hashedPassword', 'salt']
    const values = [
      this.username,
      this.hashedPassword,
      this.salt
    ]

    super.insert(this.table, keys, values)
  }

  public async create(password: string): Promise<void> {
    await this.encryptPassword(password)
    await this.insertNewAccount()
  }

  public async encryptPassword(password: string) {
    const salt = crypto.randomBytes(16)

    try {
      const hashedPassword = crypto.pbkdf2Sync(
        password,
        salt,
        100000,
        512,
        'sha512'
      )

      logger.info('Password encrypted successfully')

      this.hashedPassword =
        Buffer.from(hashedPassword).toString('hex')
      this.salt = Buffer.from(salt).toString('hex')
    } catch (error) {
      logger.error('Error while trying to encrypt password')
      throw error
    }
  }

  static async decryptPassword(
    userData: IUserDBData,
    password: string,
    done: any
  ) {
    const decodedSalt: Buffer = Buffer.from(
      userData.salt || '',
      'hex'
    )
    const decodedHashedPassword: Buffer = Buffer.from(
      userData.hashedPassword || '',
      'hex'
    )
    crypto.pbkdf2(
      password,
      decodedSalt,
      100000,
      512,
      'sha512',
      function (err, hashedPassword) {
        if (err) {
          logger.error('Error while checking password')
          done(err)
        }

        if (
          !crypto.timingSafeEqual(
            decodedHashedPassword,
            hashedPassword
          )
        ) {
          logger.error('Incorrect password')
          done(null, false, {
            message: 'Incorrect username or password.'
          })
        } else {
          logger.verbose('Correct password', {
            user: {
              id: userData.id,
              username: userData.username
            }
          })
          return done(null, userData)
        }
      }
    )
  }

  static async verify(
    username: any,
    password: any,
    done: any
  ) {
    const user = new User(username)
    const userData = await user.findByUsername()

    if (!userData) {
      logger.error('User not found', { username })
      return done(null, false, {
        message: 'Incorrect username or password.'
      })
    }

    logger.verbose('Checkin user credentials', {
      id: userData.id,
      username: userData.username
    })

    await User.decryptPassword(userData, password, done)
  }

  public setUserDataFromDB(data: IUserDBData[]) {
    this.id = data[0].id
    this.username = data[0].username
    this.hashedPassword = data[0].hashedPassword
    this.salt = data[0].salt
  }

  public getSessionToken(): string {
    return jwt.sign(
      { id: this.id },
      process.env.JWT_SECRET || '',
      {
        expiresIn: process.env.JWT_EXPIRATION || '30m'
      }
    )
  }
}
