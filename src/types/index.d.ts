import { SessionData } from 'express-session'

declare module 'express-session' {
  interface SessionData {
    user: { [key: string]: any }
    messages: string[]
  }
}

export interface IRouteResponse {
  ok: boolean
  message: string
}
