import express from 'express'
import createHttpError from 'http-errors'
import GetTelegramTokenAction from '../actions/get-telegram-token.action'
import CustomLogger from '../../../../../infrastructure/custom-logger'
import { IUser } from '../../../../../models/user/user'

const router = express.Router()

router.get('/user/telegram', async (req, res, next) => {
  CustomLogger.verbose('Retrieving telegram', {
    userId: req.user
  })
  const user: IUser | undefined = req.user

  if (!user) {
    return next(createHttpError(401, 'Unauthorized'))
  }

  const credentials = await GetTelegramTokenAction.invoke(
    user
  )

  CustomLogger.verbose(
    'Telegram credentials retrieved successfully',
    {
      credentials
    }
  )
  res.json(credentials)
})

export default router
