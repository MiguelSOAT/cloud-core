import UserTelegram from '../../../../../models/user-telegram/user-telegram.model'
import { IUser } from '../../../../../models/user/user'

export default class DeleteTelegramTokenAction {
  public static async invoke(user: IUser): Promise<void> {
    const userTelegram = new UserTelegram()
    userTelegram.userId = user.id
    await userTelegram.findByUserId()

    await userTelegram.deleteByUserId()
  }
}
