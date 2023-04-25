import express from 'express'
import PostTelegramTokenAction from '../actions/post-telegram-token.action'
import createHttpError from 'http-errors'
import CustomLogger from '../../../../../infrastructure/custom-logger'
import { IUser } from '../../../../../models/user/user'

const router = express.Router()
router.post('/user/telegram', async (req, res, next) => {
  CustomLogger.info('Setting telegram token')
  const user: IUser | undefined = req.user
  const telegramId = req.body.telegramId
  const securityToken = req.body.securityToken

  if (!user) {
    CustomLogger.error('User not found', req.user)
    return next(createHttpError(401, 'Unauthorized'))
  }

  await PostTelegramTokenAction.invoke(
    user,
    telegramId,
    securityToken
  )

  CustomLogger.info('Telegram token setted')

  res.sendStatus(200).send()
})

export default router
