import express from 'express'
import passport from 'passport'
import Logger from '../../../infrastructure/logger'
import { IUserDBData } from '../../../models/user/user'
import User from '../../../models/user/user.model'
const router = express.Router()

router.post('/login/password', function (req, res, next) {
  passport.authenticate(
    'login',
    function (err: any, userData: IUserDBData, info: any) {
      try {
        if (err || !userData) {
          Logger.error(
            'Error while logging in. User not found',
            {
              info: info
            }
          )
          return res.status(401).json({
            message: info.message
          })
        } else {
          req.login(
            userData,
            { session: false },
            async (error) => {
              if (error) return next(error)

              const user = new User(userData.username)
              user.setUserDataFromDB([userData])
              const token = user.getSessionToken()

              const defaultExpirationTime = '0.5'
              res.cookie('token', token, {
                maxAge:
                  parseInt(
                    process.env.COOKIE_EXPIRATION_TIME ||
                      `${defaultExpirationTime}`
                  ) *
                  1000 *
                  3600,
                httpOnly: true
              })

              return res.send('OK')
            }
          )
        }
      } catch (error) {
        return next(error)
      }
    }
  )(req, res, next)
})

export default router
