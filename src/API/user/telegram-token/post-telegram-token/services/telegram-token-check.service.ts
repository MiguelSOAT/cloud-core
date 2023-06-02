import {
  ITelegramCredentials,
  ITelegramTokenStatus
} from '../..'
import MongoDBConnection from '../../../../../infrastructure/mongodb-connection'
import TelegramTokenCheckDomain from '../domains/telegram-token-check.domain'
import CustomLogger from '../../../../../infrastructure/custom-logger'
import UserTelegram from '../../../../../models/user-telegram/user-telegram.model'

export default class TelegramTokenCheckService {
  public static async execute(
    telegramId: number,
    securityToken: string
  ): Promise<ITelegramTokenStatus> {
    const mongoClient = new MongoDBConnection()
    const db = await mongoClient.connect()
    const credentials: ITelegramCredentials | undefined = (
      await db
        .collection('credentials')
        .find({
          telegramId: telegramId,
          securityToken: securityToken
        })
        .sort({
          _id: -1
        })
        .toArray()
    )[0] as unknown as ITelegramCredentials

    await mongoClient.disconnect()

    const userTelegramStatus = new UserTelegram()
    await userTelegramStatus.findByTelegramId(telegramId)

    CustomLogger.verbose('Telegram tokens found', {
      credentials: credentials,
      telegramId: telegramId,
      securityToken: securityToken,
      userTelegramStatus: {
        telegramId: userTelegramStatus.telegramId,
        userId: userTelegramStatus.userId
      }
    })

    return new TelegramTokenCheckDomain(
      credentials,
      userTelegramStatus
    )
  }
}
