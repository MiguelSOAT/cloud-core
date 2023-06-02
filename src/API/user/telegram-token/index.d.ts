export interface ITelegramCredentials {
  telegramId: number
  securityToken: string
  expirationDate?: Date
}

export interface ITelegramTokenStatus {
  ok: boolean
  message: string
}
