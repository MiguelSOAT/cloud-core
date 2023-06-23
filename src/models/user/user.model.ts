import {
  IUser,
  IUserDBData,
  IUserSignupResponse
} from './user'
import MYSQLDB from '../mysqldb/mysqldb.model'
import crypto from 'node:crypto'
import CustomLogger from '../../infrastructure/custom-logger'
import jwt from 'jsonwebtoken'

export default class User extends MYSQLDB<IUserDBData> {
  public id?: number
  public username?: string
  hashedPassword?: string
  salt?: string

  table = 'USER'

  constructor(username?: string) {
    super()
    if (username) this.username = username
  }

  public getUsername(): string {
    return this.username || ''
  }

  public async findByUsername(): Promise<IUserDBData | null> {
    if (!this.username) {
      CustomLogger.error(
        `Couldn't find user in DB. Username not defined.`
      )
      return null
    }
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

  private async insertNewAccount(): Promise<IUserSignupResponse> {
    const response: IUserSignupResponse = {
      status: 200
    }

    if (
      !this.username ||
      !this.hashedPassword ||
      !this.salt
    ) {
      CustomLogger.error(
        `Couldn't intert user in DB. Username, password or salt not defined.`
      )
      throw new Error(
        'Username, password or salt not found'
      )
    }

    if (!this.hashedPassword || !this.salt) {
      CustomLogger.error(
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

    try {
      await super.insert(this.table, keys, values)
      CustomLogger.info('User inserted in DB successfully')
      await this.findByUsername()
      CustomLogger.info('User found in DB successfully')
      response.token = this.getSessionToken()
      CustomLogger.verbose(
        'User token created successfully',
        {
          token: response.token
        }
      )
    } catch (error: any) {
      CustomLogger.error(
        'Error while trying to create user in DB',
        error
      )
      response.message =
        error.code === 'ER_DUP_ENTRY'
          ? 'Username already exists'
          : 'Error while signing up'
      response.status = 500
    }

    return response
  }

  public async create(
    password: string
  ): Promise<IUserSignupResponse> {
    await this.encryptPassword(password)
    return this.insertNewAccount()
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

      CustomLogger.info('Password encrypted successfully')

      this.hashedPassword =
        Buffer.from(hashedPassword).toString('hex')
      this.salt = Buffer.from(salt).toString('hex')
    } catch (error) {
      CustomLogger.error(
        'Error while trying to encrypt password',
        {
          password
        }
      )
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
          CustomLogger.error(
            'Error while checking password'
          )
          done(err)
        }

        if (
          !crypto.timingSafeEqual(
            decodedHashedPassword,
            hashedPassword
          )
        ) {
          CustomLogger.error('Incorrect password')
          done(null, false, {
            message: 'Incorrect username or password.'
          })
        } else {
          CustomLogger.verbose('Correct password', {
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
      CustomLogger.error('User not found', { username })
      return done(null, false, {
        message: 'Incorrect username or password.'
      })
    }

    CustomLogger.verbose('Checkin user credentials', {
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
