import Logger from '../../infrastructure/logger'
import MYSQLDB from '../mysqldb/mysqldb.model'
import {
  IUserTelegramDBData,
  IUserTelegram
} from './user-telegram'

export default class UserTelegram
  extends MYSQLDB<IUserTelegramDBData>
  implements IUserTelegram
{
  public userId?: number
  public telegramToken?: string

  table = 'USER_TELEGRAM'

  constructor() {
    super()
  }

  public async findByUserId(): Promise<void> {
    if (!this.userId) {
      Logger.error('[UserTelegram] User id not set', {
        userId: this.userId
      })
      throw new Error('User id not set')
    }
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
  ): Promise<void> {
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

    this.setUserFilesFromDbResponse(dbData)
  }

  public async updateByUserId(
    telegramToken: string
  ): Promise<void> {
    if (!this.userId) {
      Logger.error('[UserTelegram] User id not set', {
        userId: this.userId
      })
      throw new Error('User id not set')
    }
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
    if (!this.userId) {
      Logger.error('[UserTelegram] User id not set', {
        userId: this.userId
      })
      throw new Error('User id not set')
    }
    const keys = ['userId', 'telegramToken']
    const values = [this.userId, telegramToken]
    await super.insert(this.table, keys, values)
  }

  private setUserFilesFromDbResponse(
    dbData: IUserTelegramDBData[]
  ): void {
    this.telegramToken = dbData[0]?.telegramToken
    this.userId = dbData[0]?.userId
  }
}
