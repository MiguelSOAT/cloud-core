export interface IUser {
  id?: number
  username?: string
}

export interface IUserCredentials {
  hashedPassword: string
  salt: string
}

export interface IUserDBData
  extends IUser,
    IUserCredentials {
  id: number
  createdAt: Date
  hashedPassword: string
  salt: string
}

export interface IUserSignupResponse {
  status: number
  message?: string
  token?: string
}
