export interface IUserTelegram {
  userId?: number
  telegramId?: string
  securityToken?: string
  expirationDate?: Date
}

export interface IUserTelegramDBData extends IUserTelegram {
  id: number
  createdAt: string
}
