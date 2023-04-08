import logger from '../../../../infrastructure/logger'
import UserTelegram from '../../../../models/user-telegram/user-telegram.model'
import { IUser } from '../../../../models/user/user'

export default class PostTelegramTokenAction {
  public static async invoke(
    user: IUser,
    telegramId: string,
    securityToken: string
  ): Promise<void> {
    const userTelegram = new UserTelegram()
    userTelegram.userId = user.id
    await userTelegram.findByUserId()

    if (userTelegram.telegramId) {
      logger.info('Updating telegram user data')
      userTelegram.securityToken = securityToken
      userTelegram.telegramId = telegramId
      await userTelegram.updateByUserId(
        telegramId,
        securityToken
      )
    } else {
      logger.info('Inserting telegram user data')
      userTelegram.userId = user.id
      await userTelegram.insertNewToken(
        telegramId,
        securityToken
      )
    }
  }
}
