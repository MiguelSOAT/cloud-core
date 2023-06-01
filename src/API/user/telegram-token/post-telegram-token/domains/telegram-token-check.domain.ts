import {
  ITelegramCredentials,
  ITelegramTokenStatus
} from '../..'

export default class TelegramTokenCheckDomain
  implements ITelegramTokenStatus
{
  ok: boolean
  message: string

  constructor(
    credentials: ITelegramCredentials | undefined
  ) {
    this.ok = true
    if (!credentials) {
      this.ok = false
      this.message = 'Invalid credentials'
    } else {
      const isTokenValid = this.checkExpirationDate(
        credentials.expirationDate
      )
      this.ok = isTokenValid
      this.message = isTokenValid
        ? 'Valid credentials'
        : 'Please, request a new token in your telegram bot. Your token is expired'
    }
  }

  private checkExpirationDate(
    expirationDate: Date | undefined
  ): boolean {
    return !!expirationDate && expirationDate > new Date()
  }
}
