import UserTelegram from '../../../../models/user-telegram/user-telegram.model'

export default class PutTelegramTokenAction {
  public static async invoke(
    userId: number,
    telegramToken: string
  ): Promise<void> {
    const user = new UserTelegram()
    user.userId = userId
    await user.findByUserId()

    await user.updateByUserId(telegramToken)
  }
}
