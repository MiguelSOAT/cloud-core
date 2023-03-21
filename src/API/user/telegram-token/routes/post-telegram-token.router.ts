import express from 'express'
import passport from 'passport'
import PostTelegramTokenAction from '../actions/post-telegram-token.action'

const router = express.Router()

router.post(
  '/user/telegram_token',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    const userId = req.user as number
    const telegramToken = req.body.telegramToken
    const error = await PostTelegramTokenAction.invoke(
      userId,
      telegramToken
    )

    if (error) {
      return next(error)
    }

    res.sendStatus(200).send()
  }
)

export default router
