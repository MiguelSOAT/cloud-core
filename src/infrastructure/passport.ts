import passport from 'passport'
import passportStrategy from 'passport-local'
import User from '../models/user/user.model'
import { IUser } from '../models/user/user'
import logger from './logger'
const LocalStrategy = passportStrategy.Strategy

export default function passportConfiguration() {
  passport.use(new LocalStrategy(User.verify))

  passport.serializeUser(function (user: IUser, done) {
    logger.verbose('serializedUser', user)
    done(null, user.id)
  })

  passport.deserializeUser(function (id: number, done) {
    const user = new User()
    logger.verbose('deserializedUser', id)
    user.findById(id).then((userData) => {
      done(null, userData)
    })
  })

  // function isAuthenticated(req: any, res: any, next: any) {
  //   if (req.isAuthenticated()) {
  //     logger.verbose('User authenticated', req.user)
  //     return next()
  //   }
  //   logger.verbose('User not authenticated', req.user)
  //   res.redirect('/login')
  // }
}
