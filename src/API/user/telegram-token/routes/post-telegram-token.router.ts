import express from 'express'
import passport from 'passport'
import PostTelegramTokenAction from '../actions/post-telegram-token.action'
import { IUser } from '../../../../models/user/user'
import createHttpError from 'http-errors'
import logger from '../../../../infrastructure/logger'

const router = express.Router()
router.post('/user/telegram', async (req, res, next) => {
  logger.info('Setting telegram token')
  const user: IUser | undefined = req.user
  const telegramId = req.body.telegramId
  const securityToken = req.body.securityToken

  if (!user) {
    logger.error('User not found', req.user)
    return next(createHttpError(401, 'Unauthorized'))
  }

  await PostTelegramTokenAction.invoke(
    user,
    telegramId,
    securityToken
  )

  logger.info('Telegram token setted')

  res.sendStatus(200).send()
})

export default router
