import { ITelegramTokenStatus } from '../..'
import CustomLogger from '../../../../../infrastructure/custom-logger'
import UserTelegram from '../../../../../models/user-telegram/user-telegram.model'
import { IUser } from '../../../../../models/user/user'
import TelegramTokenCheckService from '../services/telegram-token-check.service'

export default class PostTelegramTokenAction {
  public static async invoke(
    user: IUser,
    telegramId: string,
    securityToken: string
  ): Promise<ITelegramTokenStatus> {
    const userTelegram = new UserTelegram()
    userTelegram.userId = user.id
    await userTelegram.findByUserId()

    const userTelegramStatus =
      await TelegramTokenCheckService.execute(
        telegramId,
        securityToken
      )

    if (userTelegramStatus.ok) {
      if (userTelegram.telegramId) {
        CustomLogger.info('Updating telegram user data')
        userTelegram.securityToken = securityToken
        userTelegram.telegramId = telegramId
        await userTelegram.updateByUserId(
          telegramId,
          securityToken
        )
      } else {
        CustomLogger.info('Inserting telegram user data')
        userTelegram.userId = user.id
        await userTelegram.insertNewToken(
          telegramId,
          securityToken
        )
      }
    }

    return userTelegramStatus
  }
}
