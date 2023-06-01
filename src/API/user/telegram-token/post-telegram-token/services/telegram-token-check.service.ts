import {
  ITelegramCredentials,
  ITelegramTokenStatus
} from '../..'
import MongoDBConnection from '../../../../../infrastructure/mongodb-connection'
import TelegramTokenCheckDomain from '../domains/telegram-token-check.domain'

export default class TelegramTokenCheckService {
  public static async execute(
    telegramId: string,
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

    return new TelegramTokenCheckDomain(credentials)
  }
}
