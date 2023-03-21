export interface IUserTelegram {
  userId: number
  telegramToken?: string
}

export interface IUserTelegramDBData extends IUserTelegram {
  id: number
  createdAt: string
}
