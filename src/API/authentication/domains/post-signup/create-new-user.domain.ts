import { ISignupResponse } from '../../interfaces/authentication'
export class CreateNewUserDomain
  implements ISignupResponse
{
  ok: boolean
  code?: number | undefined
  message?: string | undefined
  constructor(sqlError?: any) {
    const isError = sqlError !== undefined
    this.ok = !isError
    if (isError) {
      const error = this.getError(sqlError)
      this.code = error?.code || 500
      this.message =
        error?.message || 'Internal server error'
    }
  }

  public getError(error: any) {
    switch (error.code) {
      case 'ER_DUP_ENTRY':
        return {
          code: 409,
          message: 'User already exists'
        }
    }
  }
}
