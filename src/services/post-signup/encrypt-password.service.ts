import { INewUserData } from '../../interfaces/authentication'
import crypto from 'node:crypto'
import { EncryptPasswordDomain } from '../../domains/post-signup/encrypt-password.domain'
import logger from '../../infrastructure/logger'

export default class EncryptPasswordService {
  public static async execute(
    username: string,
    password: string
  ): Promise<INewUserData> {
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

      return new EncryptPasswordDomain(
        username,
        hashedPassword.toString('hex'),
        salt.toString('hex')
      )
    } catch (error) {
      logger.error('Error while trying to encrypt password')
      throw error
    }
  }
}
