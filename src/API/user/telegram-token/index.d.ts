export interface ITelegramCredentials {
  telegramId: string
  securityToken: string
  expirationDate?: Date
}

export interface ITelegramTokenStatus {
  ok: boolean
  message: string
}
