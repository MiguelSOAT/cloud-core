import { INewUserData } from '../../interfaces/authentication'
export class EncryptPasswordDomain implements INewUserData {
  username: string
  hashedPassword: string
  salt: string
  constructor(
    username: string,
    hashedPassword: string,
    salt: string
  ) {
    this.username = username
    this.hashedPassword = hashedPassword
    this.salt = salt
  }
}
