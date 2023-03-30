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
    res.status(response.status).send({
      message: response.message
    })
  } catch (e) {
    res.status(500).send()
  }
})

export default router
