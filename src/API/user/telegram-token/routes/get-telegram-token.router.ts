import express from 'express'
import passport from 'passport'
import { IUser } from '../../../../models/user/user'
import createHttpError from 'http-errors'
import GetTelegramTokenAction from '../actions/get-telegram-token.action'
import logger from '../../../../infrastructure/logger'

const router = express.Router()

router.get('/user/telegram', async (req, res, next) => {
  logger.verbose('Retrieving telegram', {
    userId: req.user
  })
  const user: IUser | undefined = req.user

  if (!user) {
    return next(createHttpError(401, 'Unauthorized'))
  }

  const credentials = await GetTelegramTokenAction.invoke(
    user
  )

  logger.verbose(
    'Telegram credentials retrieved successfully',
    {
      credentials
    }
  )
  res.json(credentials)
})

export default router
