import { ITelegramCredentials } from '../../API/user/telegram-token/interfaces'
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
  public telegramId?: string
  public securityToken?: string

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

  public async findByTelegramId(
    telegramId: string
  ): Promise<void> {
    const values = ['*']
    const conditions = ['telegramId']
    const conditionsValues = [telegramId]
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
    telegramId: string,
    securityToken: string
  ): Promise<void> {
    if (!this.userId) {
      Logger.error('[UserTelegram] User id not set', {
        userId: this.userId
      })
      throw new Error('User id not set')
    }
    const conditions = ['userId']
    const conditionsValues = [this.userId]
    const keys = ['telegramId', 'securityToken']
    const values = [telegramId, securityToken]
    await super.update(
      this.table,
      keys,
      values,
      conditions,
      conditionsValues
    )
  }

  public async insertNewToken(
    telegramId: string,
    securityToken: string
  ): Promise<void> {
    if (!this.userId) {
      Logger.error('[UserTelegram] User id not set', {
        userId: this.userId
      })
      throw new Error('User id not set')
    }
    const keys = ['userId', 'telegramId', 'securityToken']
    const values = [this.userId, telegramId, securityToken]
    await super.insert(this.table, keys, values)
  }

  private setUserFilesFromDbResponse(
    dbData: IUserTelegramDBData[]
  ): void {
    this.telegramId = dbData[0]?.telegramId
    this.securityToken = dbData[0]?.securityToken
    this.userId = dbData[0]?.userId
  }

  public getTelegramCredentials(): ITelegramCredentials {
    const credentials: ITelegramCredentials = {
      telegramId: this.telegramId || '',
      securityToken: this.securityToken || ''
    }

    return credentials
  }
}
