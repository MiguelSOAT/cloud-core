import express from 'express'
import getFilesRouter from './API/files/routes/get-files.router'
import loginRouter from './API/authentication/routes/post-login.route'
import signupRouter from './API/authentication/routes/post-signup.route'
import logoutRouter from './API/authentication/routes/post-logout.route'
import postTelegramToken from './API/user/telegram-token/routes/post-telegram-token.router'
import getTelegramToken from './API/user/telegram-token/routes/get-telegram-token.router'
import authenticateRouter from './API/authentication/routes/authenticated.route'
import getFile from './API/files/routes/get-file.router'

const app = express()
import kafkaConsumer from './kafka_consumer'
import env from 'dotenv'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import csrf from 'csurf'
import passport from 'passport'
import createError from 'http-errors'
import passportConfiguration from './infrastructure/passport'
import cors from 'cors'
import logger from './infrastructure/logger'

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
    logger.verbose('User authenticated', req.user)
    return next()
  }
  // Si el usuario no está autenticado, redirigir a la página de inicio de sesión
  res.redirect('/login')
})

app.use('/v1', getFilesRouter)
app.use('/v1', postTelegramToken)
app.use('/v1', getTelegramToken)
app.use('/v1', authenticateRouter)
app.use('/v1', getFile)

app.use(function (req, res, next) {
  logger.error('URL 404 Not Found')
  next(createError(404))
})

app.listen(8080, () => {
  console.log('Server started on port 8080')
})

// error handler
app.use(function (err: any, req: any, res: any, next: any) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error =
    req.app.get('env') === 'development' ? err : {}

  logger.error(err.message, err.stack)
  res.status(err.status || 500)
  // res.render('error')
  res.send(err)
})

// searchFile().catch(console.error)

kafkaConsumer().catch(console.error)
