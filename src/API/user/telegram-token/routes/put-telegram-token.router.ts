import express from 'express'
import passport from 'passport'
import PutTelegramTokenAction from '../actions/put-telegram-token.action'

const router = express.Router()

router.put(
  '/user/telegram_token',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const userId = req.user as number
    const telegramToken = req.body.telegramToken
    await PutTelegramTokenAction.invoke(
      userId,
      telegramToken
    )

    res.sendStatus(200).send()
  }
)

export default router
