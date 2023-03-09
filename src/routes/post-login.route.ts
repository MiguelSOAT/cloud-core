import express from 'express'
import passport from 'passport'
import MYSQLDB from '../infrastructure/mysqldb'
import crypto from 'node:crypto'
import Logger from '../infrastructure/logger'
const LocalStrategy = require('passport-local')
const router = express.Router()

passport.serializeUser(function (user: any, done) {
  process.nextTick(function () {
    done(null, { id: user.id, username: user.username })
  })
})

passport.deserializeUser(function (user: any, done) {
  process.nextTick(function () {
    return done(null, user)
  })
})

function check(password: any, user: any, done: any) {
  Logger.verbose('User salt', { user })
  const decodedSalt: Buffer = Buffer.from(user.salt, 'hex')
  const decodedHashedPassword: Buffer = Buffer.from(
    user.hashed_password,
    'hex'
  )
  const a = crypto.pbkdf2(
    password,
    decodedSalt,
    100000,
    512,
    'sha512',
    function (err, hashedPassword) {
      if (err) {
        Logger.error('Error while checking password')
        done(err) // TODO
      }

      Logger.info('Checking password')
      if (
        !crypto.timingSafeEqual(
          decodedHashedPassword,
          hashedPassword
        )
      ) {
        Logger.error('Incorrect password')
        done(null, false, {
          message: 'Incorrect username or password.'
        })
      }
      Logger.verbose('Password correct', {
        user: { id: user.id, username: user.username }
      })
      return done(null, user)
    }
  )

  Logger.verbose('a', { a })
  return a
}

passport.use(
  new LocalStrategy(async function verify(
    username: any,
    password: any,
    done: any
  ) {
    const db = new MYSQLDB()
    db.connect()
    Logger.info('Connected to database')
    try {
      const query = db.query(
        'SELECT * FROM USER WHERE username = ?',
        [username]
      )
      const rows = (await query) as any[]
      Logger.verbose('User found', { rows })
      if (!rows) {
        return done(null, false, {
          message: 'Incorrect username or password.'
        })
      }
      //
      return check(password, rows[0], done)
      // Logger.verbose('b', { b })
    } catch (error) {
      return done(error)
    }
  })
)

router.post('/login/password', function (req, res, next) {
  passport.authenticate(
    'local',
    function (error: any, user: any, info: any) {
      // A error also means, an unsuccessful login attempt
      if (error) {
        console.error(error)
        console.log('Failed login:')
        // And do whatever you want here.
        return next(new Error('AuthenticationError'))
      }

      if (user === false) {
        // handle login error ...
        console.log('Failed login:')
        return next(new Error('AuthenticationError'))
      } else {
        // handle successful login ...
        console.log('Successful login:')
        // res.redirect('./')

        res.send({
          user: req.user
        })
      }
    }
  )(req, res, next)
})

export default router
