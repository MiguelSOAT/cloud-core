import createHttpError, { HttpError } from 'http-errors'
import UserTelegram from '../../../../models/user-telegram/user-telegram.model'

export default class PostTelegramTokenAction {
  public static async invoke(
    userId: number,
    telegramToken: string
  ): Promise<HttpError<400> | undefined> {
    const user = new UserTelegram()
    user.userId = userId
    await user.findByUserId()

    if (user.telegramToken) {
      return createHttpError(
        400,
        'Telegram token already exists'
      )
    } else {
      await user.insertNewToken(telegramToken)
    }
  }
}
