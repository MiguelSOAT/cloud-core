import passport from 'passport'
import passportStrategy from 'passport-local'
import User from '../models/user/user.model'
import { IUser } from '../models/user/user'
const LocalStrategy = passportStrategy.Strategy

export default function passportConfiguration() {
  passport.use(
    new LocalStrategy(User.verify)
    // new JWTstrategy(
    //   {
    //     secretOrKey: process.env.JWT_SECRET,
    //     jwtFromRequest:
    //       ExtractJWT.fromAuthHeaderAsBearerToken()
    //   },
    //   async (token, done) => {
    //     try {
    //       return done(null, token.id)
    //     } catch (error) {
    //       done(error)
    //     }
    //   }
    // )
  )

  passport.serializeUser(function (user: IUser, done) {
    console.log('serializeUser', user)
    done(null, user.id)
  })

  passport.deserializeUser(function (id: number, done) {
    const user = new User()
    console.log('deserializeUser', id)
    user.findById(id).then((userData) => {
      done(null, userData)
    })
  })

  // passport.use('login', new LocalStrategy(User.verify))
}
