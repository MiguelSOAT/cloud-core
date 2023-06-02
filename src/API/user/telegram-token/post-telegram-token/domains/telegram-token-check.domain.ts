import {
  ITelegramCredentials,
  ITelegramTokenStatus
} from '../..'
import CustomLogger from '../../../../../infrastructure/custom-logger'
import UserTelegram from '../../../../../models/user-telegram/user-telegram.model'

export default class TelegramTokenCheckDomain
  implements ITelegramTokenStatus
{
  ok: boolean
  message: string

  constructor(
    credentials: ITelegramCredentials | undefined,
    userTelegram: UserTelegram
  ) {
    this.ok = true
    this.message = ''

    const hasCredentials = !!credentials
    const hasUserTelegramSetted = !!userTelegram.userId

    if (hasCredentials) {
      const isTokenValid = this.checkExpirationDate(
        credentials.expirationDate
      )
      if (!isTokenValid) {
        this.tokenExpired()
      } else if (hasUserTelegramSetted) {
        this.tokenIsBeingUsed()
      } else {
        this.tokenIsValid()
      }
    } else {
      this.tokenIsInvalid()
    }
  }

  private checkExpirationDate(
    expirationDate: Date | undefined
  ): boolean {
    const isExpirationDateValid =
      !!expirationDate &&
      new Date(expirationDate) > new Date()

    CustomLogger.verbose('Expiration date validation', {
      isExpirationDateValid: isExpirationDateValid
    })
    return isExpirationDateValid
  }

  private tokenExpired(): void {
    this.ok = false
    this.message =
      'Please, request a new token in your telegram bot. Your token is expired'
  }

  private tokenIsBeingUsed(): void {
    this.ok = false
    this.message =
      'This telegram account is already linked to another user'
  }

  private tokenIsValid(): void {
    this.ok = true
    this.message = 'Valid credentials'
  }

  private tokenIsInvalid(): void {
    this.ok = false
    this.message = 'Invalid credentials'
  }
}
