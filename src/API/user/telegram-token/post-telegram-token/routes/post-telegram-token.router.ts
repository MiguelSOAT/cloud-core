import express from 'express'
import PostTelegramTokenAction from '../actions/post-telegram-token.action'
import createHttpError from 'http-errors'
import CustomLogger from '../../../../../infrastructure/custom-logger'
import { IUser } from '../../../../../models/user/user'

const router = express.Router()
router.post('/user/telegram', async (req, res, next) => {
  CustomLogger.info('Setting telegram token')
  const user: IUser | undefined = req.user
  const telegramId: number = req.body.telegramId
  const securityToken: string = req.body.securityToken

  if (!user) {
    CustomLogger.error('User not found', req.user)
    return next(createHttpError(401, 'Unauthorized'))
  }

  const response = await PostTelegramTokenAction.invoke(
    user,
    telegramId,
    securityToken
  )

  res.json(response)
})

export default router
