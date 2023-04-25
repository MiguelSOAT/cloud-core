import express from 'express'
import createHttpError from 'http-errors'
import DeleteTelegramTokenAction from '../actions/delete-telegram-token.action'
import CustomLogger from '../../../../../infrastructure/custom-logger'
import { IUser } from '../../../../../models/user/user'

const router = express.Router()

router.delete('/user/telegram', async (req, res, next) => {
  CustomLogger.verbose('Deleting telegram credentials', {
    userId: req.user
  })
  const user: IUser | undefined = req.user

  if (!user) {
    return next(createHttpError(401, 'Unauthorized'))
  }

  const credentials =
    await DeleteTelegramTokenAction.invoke(user)

  CustomLogger.verbose(
    'Telegram credentials have been successfully deleted',
    {
      credentials
    }
  )
  res.json(credentials)
})

export default router
