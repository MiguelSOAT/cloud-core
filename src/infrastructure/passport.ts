import {
  Strategy as JWTstrategy,
  ExtractJwt as ExtractJWT
} from 'passport-jwt'
import passport from 'passport'
import passportStrategy from 'passport-local'
import User from '../models/user/user.model'
const LocalStrategy = passportStrategy.Strategy

export default function passportConfiguration() {
  passport.use(
    new JWTstrategy(
      {
        secretOrKey: process.env.JWT_SECRET,
        jwtFromRequest:
          ExtractJWT.fromAuthHeaderAsBearerToken()
      },
      async (token, done) => {
        try {
          return done(null, token.id)
        } catch (error) {
          done(error)
        }
      }
    )
  )

  passport.serializeUser(function (user, done) {
    console.log('serializeUser', user)
    done(null, user)
  })

  passport.deserializeUser(function (id, done) {
    const user = new User()
    console.log('deserializeUser', id)
    user.findById(id as number).then((userData) => {
      done(null, userData)
    })
  })

  passport.use('login', new LocalStrategy(User.verify))
}
