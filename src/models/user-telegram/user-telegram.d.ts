export interface IUserTelegram {
  userId?: number
  telegramId?: string
  securityToken?: string
}

export interface IUserTelegramDBData extends IUserTelegram {
  id: number
  createdAt: string
}
