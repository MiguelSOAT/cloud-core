import express from 'express'
import getFilesRouter from './API/files/get-files/routes/get-files.router'
import loginRouter from './API/authentication/post-login/routes/post-login.route'
import signupRouter from './API/authentication/post-signup/routes/post-signup.route'
import logoutRouter from './API/authentication/post-logout/routes/post-logout.route'
import postTelegramToken from './API/user/telegram-token/post-telegram-token/routes/post-telegram-token.router'
import getTelegramToken from './API/user/telegram-token/get-telegram-token/routes/get-telegram-token.router'
import authenticateRouter from './API/authentication/authenticated/routes/authenticated.route'
import deleteTelegramTokenRouter from './API/user/telegram-token/delete-telegram-token/routes/delete-telegram-token.router'
import getFile from './API/files/get-file/routes/get-file.router'
import deleteFileRouter from './API/files/delete-file/routes/delete-file.router'
import postFile from './API/files/post-file/routes/post-file.router'

import kafkaConsumer from './kafka_consumer'
import env from 'dotenv'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import csrf from 'csurf'
import passport from 'passport'
import createError from 'http-errors'
import passportConfiguration from './infrastructure/passport'
import cors from 'cors'
import CustomLogger from './infrastructure/custom-logger'

const app = express()
env.config()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
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
// app.use(csrf())

passportConfiguration()
app.use('/v1', signupRouter)
app.use('/v1', loginRouter)
app.use('/v1', logoutRouter)

app.use(function (req, res, next) {
  if (req.isAuthenticated()) {
    // Si el usuario está autenticado, continuar con la solicitud
    CustomLogger.verbose('User authenticated', req.user)
    return next()
  }
  // Si el usuario no está autenticado, redirigir a la página de inicio de sesión
  res.redirect('/login')
})

app.use('/v1', postTelegramToken)
app.use('/v1', getTelegramToken)
app.use('/v1', authenticateRouter)
app.use('/v1', deleteTelegramTokenRouter)
app.use('/v1', getFile)
app.use('/v1', getFilesRouter)
app.use('/v1', deleteFileRouter)
app.use('/v1', postFile)

app.use(function (req, res, next) {
  CustomLogger.error('URL 404 Not Found')
  next(createError(404))
})

app.listen(8080, () => {
  console.log('Server started on port 8080')
})

app.use(function (err: any, req: any, res: any, next: any) {
  res.locals.message = err.message
  res.locals.error =
    req.app.get('env') === 'development' ? err : {}

  CustomLogger.error(err.message, err.stack)
  res.status(err.status || 500)
  res.send(err)
})

kafkaConsumer().catch(console.error)
