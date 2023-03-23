import express from 'express'
import logger from '../../../infrastructure/logger'
import {
  IUserDBData,
  IUserSignupResponse
} from '../../../models/user/user'
import User from '../../../models/user/user.model'

const router = express.Router()

router.post('/signup', async (req, res, next) => {
  const username = req.body.username
  const password = req.body.password

  try {
    logger.verbose('Creating user', { username })
    const user = new User(username)

    const response: IUserSignupResponse = await user.create(
      password
    )

    if (response.status === 200 && response.token) {
      const defaultExpirationTime = '0.5'
      res.cookie('cloudToken', response.token, {
        maxAge:
          parseInt(
            process.env.COOKIE_EXPIRATION_TIME ||
              `${defaultExpirationTime}`
          ) *
          1000 *
          3600,
        httpOnly: true
      })
    }
    res.status(response.status).send({
      message: response.message,
      token: response.token
    })
  } catch (e) {
    res.status(500).send()
  }
})

export default router
