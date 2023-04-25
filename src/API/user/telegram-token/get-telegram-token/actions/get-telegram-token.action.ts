import { ITelegramCredentials } from '../..'
import UserTelegram from '../../../../../models/user-telegram/user-telegram.model'
import { IUser } from '../../../../../models/user/user'

export default class GetTelegramTokenAction {
  public static async invoke(
    user: IUser
  ): Promise<ITelegramCredentials> {
    const userTelegram = new UserTelegram()
    userTelegram.userId = user.id
    await userTelegram.findByUserId()

    return userTelegram.getTelegramCredentials()
  }
}
