import express from 'express'
import passport from 'passport'
import User from '../../../../models/user/user.model'
import CustomLogger from '../../../../infrastructure/custom-logger'
import { IUserSignupResponse } from '../../../../models/user/user'

const router = express.Router()

router.post(
  '/signup',
  async (req, res, next) => {
    const username = req.body.username
    const password = req.body.password

    try {
      CustomLogger.verbose('Creating user', { username })
      const user = new User(username)

      const response: IUserSignupResponse =
        await user.create(password)

      if (response.status !== 200) {
        return res.status(response.status).send({
          message: response.message
        })
      }

      CustomLogger.verbose('User created', { username })

      return next()
    } catch (error: any) {
      CustomLogger.error(
        'Error while trying to create user',
        error
      )
      return res.status(500).send({
        message: error.message
      })
    }
  },
  passport.authenticate('local', {
    failureFlash: true
  }),
  (req, res, next) => {
    req.session.save((err) => {
      if (err) {
        return next(err)
      }
      res.send()
    })
  }
)

export default router
