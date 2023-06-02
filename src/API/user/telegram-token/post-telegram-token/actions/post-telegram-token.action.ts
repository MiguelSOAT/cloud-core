import { ITelegramTokenStatus } from '../..'
import CustomLogger from '../../../../../infrastructure/custom-logger'
import UserTelegram from '../../../../../models/user-telegram/user-telegram.model'
import { IUser } from '../../../../../models/user/user'
import TelegramTokenCheckService from '../services/telegram-token-check.service'

export default class PostTelegramTokenAction {
  public static async invoke(
    user: IUser,
    telegramId: number,
    securityToken: string
  ): Promise<ITelegramTokenStatus> {
    const userTelegram: UserTelegram = new UserTelegram()
    userTelegram.userId = user.id
    await userTelegram.findByUserId()

    const userTelegramStatus =
      await TelegramTokenCheckService.execute(
        telegramId,
        securityToken
      )

    if (userTelegramStatus.ok) {
      CustomLogger.info('Inserting telegram user data')
      userTelegram.userId = user.id
      await userTelegram.insertNewToken(
        telegramId,
        securityToken
      )
    }

    return userTelegramStatus
  }
}
