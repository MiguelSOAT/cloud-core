import passport from 'passport'
import passportStrategy from 'passport-local'
import User from '../models/user/user.model'
import { IUser } from '../models/user/user'
import CustomLogger from './custom-logger'
const LocalStrategy = passportStrategy.Strategy

export default function passportConfiguration() {
  passport.use(new LocalStrategy(User.verify))

  passport.serializeUser(function (user: IUser, done) {
    CustomLogger.verbose('serializedUser', user)
    done(null, user.id)
  })

  passport.deserializeUser(function (id: number, done) {
    const user = new User()
    CustomLogger.verbose('deserializedUser', id)
    user.findById(id).then((userData) => {
      done(null, userData)
    })
  })

  passport.authenticate('local', {
    successRedirect: '/v1/login',
    failureRedirect: '/v1/login'
  })
}
