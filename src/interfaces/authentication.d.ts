export interface ISignupDBError {
  code?: number
  message?: string
}

export interface ISignupResponse extends ISignupDBError {
  ok: boolean
}

export interface INewUserData {
  username: string
  hashedPassword: string
  salt: string
}
