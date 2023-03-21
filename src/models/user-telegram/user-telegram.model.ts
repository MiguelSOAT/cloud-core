import MYSQLDB from '../mysqldb/mysqldb.model'
import {
  IUserTelegramDBData,
  IUserTelegram
} from './user-telegram'

export default class UserTelegram
  extends MYSQLDB<IUserTelegramDBData>
  implements IUserTelegram
{
  userId: number
  telegramToken?: string

  table = 'USER_TELEGRAM'

  constructor(userId: number) {
    super()
    this.userId = userId
  }

  public async findByUserId(): Promise<void> {
    const values = ['*']
    const conditions = ['userId']
    const conditionsValues = [this.userId]
    const dbData: IUserTelegramDBData[] =
      await super.select(
        this.table,
        values,
        conditions,
        conditionsValues
      )

    this.setUserFilesFromDbResponse(dbData)
  }

  public async findByTelegramToken(
    telegramToken: string
  ): Promise<number | null> {
    const values = ['*']
    const conditions = ['telegramToken']
    const conditionsValues = [telegramToken]
    const dbData: IUserTelegramDBData[] =
      await super.select(
        this.table,
        values,
        conditions,
        conditionsValues
      )

    return dbData[0]?.userId || null
  }

  public async updateByUserId(
    telegramToken: string
  ): Promise<void> {
    const conditions = ['userId']
    const conditionsValues = [this.userId]
    const keys = ['telegramToken']
    const values = [telegramToken]
    await super.update(
      this.table,
      keys,
      values,
      conditions,
      conditionsValues
    )
  }

  public async insertNewToken(
    telegramToken: string
  ): Promise<void> {
    const keys = ['userId', 'telegramToken']
    const values = [this.userId, telegramToken]
    await super.insert(this.table, keys, values)
  }

  private setUserFilesFromDbResponse(
    dbData: IUserTelegramDBData[]
  ): void {
    this.telegramToken = dbData[0]?.telegramToken
  }
}
