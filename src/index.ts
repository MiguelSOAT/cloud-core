import express from 'express'
import getFilesRouter from './API/files/get-files/routes/get-files.router'
import loginRouter from './API/authentication/post-login/routes/post-login.route'
import signupRouter from './API/authentication/post-signup/routes/post-signup.route'
import logoutRouter from './API/authentication/post-logout/routes/post-logout.route'
import postTelegramToken from './API/user/telegram-token/post-telegram-token/routes/post-telegram-token.router'
import getTelegramToken from './API/user/telegram-token/get-telegram-token/routes/get-telegram-token.router'
import authenticateRouter from './API/authentication/authenticated/routes/authenticated.route'
import deleteTelegramTokenRouter from './API/user/telegram-token/delete-telegram-token/routes/delete-telegram-token.router'
import getFileRouter from './API/files/get-file/routes/get-file.router'
import deleteFileRouter from './API/files/delete-file/routes/delete-file.router'
import postFileRouter from './API/files/post-file/routes/post-file.router'
import getUserStatsRouter from './API/user/stats/get-stats/routes/get-user-stats.router'

import env from 'dotenv'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import passport from 'passport'
import createError from 'http-errors'
import passportConfiguration from './infrastructure/passport'
import CustomLogger from './infrastructure/custom-logger'
import flash from 'connect-flash'

const app = express()

env.config()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(flash())
app.use(
  session({
    secret: process.env.SESSION_TOKEN || 'secret',
    resave: false, // don't save session if unmodified
    saveUninitialized: false,
    cookie: {
      maxAge:
        parseInt(
          process.env.COOKIE_EXPIRATION_TIME || '1800'
        ) * 1000
    }
  })
)
app.use(passport.initialize())
app.use(passport.session())

passportConfiguration()
app.use('/v1', signupRouter)
app.use('/v1', loginRouter)
app.use('/v1', logoutRouter)
app.use('/v1', getUserStatsRouter)

app.use(function (req, res, next) {
  if (req.isAuthenticated()) {
    CustomLogger.verbose('User authenticated', req.user)
    return next()
  }
  res.redirect('/login')
})

app.use('/v1', postTelegramToken)
app.use('/v1', getTelegramToken)
app.use('/v1', authenticateRouter)
app.use('/v1', deleteTelegramTokenRouter)
app.use('/v1', getFileRouter)
app.use('/v1', getFilesRouter)
app.use('/v1', deleteFileRouter)
app.use('/v1', postFileRouter)

app.use(function (req, res, next) {
  CustomLogger.error('URL 404 Not Found', {
    url: req.url
  })
  next(createError(404))
})

app.use(function (err: any, req: any, res: any, next: any) {
  res.locals.message = err.message
  res.locals.error =
    req.app.get('env') === 'development' ? err : {}

  CustomLogger.error('Request Error', {
    message: err.message
  })
  res.status(err.status || 500)
  res.send(err)
})

export default app
