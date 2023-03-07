import { CreateNewUserDomain } from '../../domains/post-signup/create-new-user.domain'
import Logger from '../../infrastructure/logger'
import MYSQLDB from '../../infrastructure/mysqldb'
import {
  INewUserData,
  ISignupResponse
} from '../../interfaces/authentication'

export default class CreateNewUserService {
  public static async execute(
    credentials: INewUserData
  ): Promise<ISignupResponse> {
    const db: MYSQLDB = new MYSQLDB()

    db.connect()

    const queryPromise = db.query(
      'INSERT INTO USER (username, hashed_password, salt) VALUES (?, ?, ?)',
      [
        credentials.username,
        credentials.hashedPassword,
        credentials.salt
      ]
    )

    let sqlError: any | undefined
    try {
      await queryPromise
      Logger.verbose('User created successfully', {
        username: credentials.username
      })
    } catch (error: any) {
      Logger.error('Error while trying to create user', {
        username: credentials.username,
        error
      })
      sqlError = error
    }

    return new CreateNewUserDomain(sqlError)
  }
}
