import express from 'express'
import passport from 'passport'
import MYSQLDB from '../infrastructure/mysqldb'
import crypto from 'node:crypto'
import Logger from '../infrastructure/logger'
const LocalStrategy = require('passport-local')
const router = express.Router()

function check(password: any, user: any, cb: any) {
  Logger.verbose('User salt', { user })
  const decodedSalt: Buffer = Buffer.from(user.salt, 'hex')
  const decodedHashedPassword: Buffer = Buffer.from(
    user.hashed_password,
    'hex'
  )
  return crypto.pbkdf2(
    password,
    decodedSalt,
    100000,
    512,
    'sha512',
    function (err, hashedPassword) {
      if (err) {
        Logger.error('Error while checking password')
        return cb(err)
      }

      Logger.info('Checking password')
      if (
        !crypto.timingSafeEqual(
          decodedHashedPassword,
          hashedPassword
        )
      ) {
        Logger.error('Incorrect password')
        return cb(null, false, {
          message: 'Incorrect username or password.'
        })
      }
      Logger.verbose('Password correct', {
        cb: cb.toString()
      })
      return cb(null, user)
    }
  )
}

passport.use(
  new LocalStrategy(async function verify(
    username: any,
    password: any,
    cb: any
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
        return cb(null, false, {
          message: 'Incorrect username or password.'
        })
      }
      return check(password, rows[0], cb)
    } catch (error) {
      return cb(error)
    }
  })
)
router.post(
  '/login/password',
  passport.authenticate('local', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/login',
    failureMessage: true
  })
)

export default router
