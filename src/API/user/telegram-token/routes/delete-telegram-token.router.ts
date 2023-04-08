import express from 'express'
import { IUser } from '../../../../models/user/user'
import createHttpError from 'http-errors'
import logger from '../../../../infrastructure/logger'
import DeleteTelegramTokenAction from '../actions/delete-telegram-token.action'

const router = express.Router()

router.delete('/user/telegram', async (req, res, next) => {
  logger.verbose('Deleting telegram credentials', {
    userId: req.user
  })
  const user: IUser | undefined = req.user

  if (!user) {
    return next(createHttpError(401, 'Unauthorized'))
  }

  const credentials =
    await DeleteTelegramTokenAction.invoke(user)

  logger.verbose(
    'Telegram credentials have been successfully deleted',
    {
      credentials
    }
  )
  res.json(credentials)
})

export default router
