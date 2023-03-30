import express from 'express'
import getImagesRouter from './API/files/routes/get-images.router'
import loginRouter from './API/authentication/routes/post-login.route'
import signupRouter from './API/authentication/routes/post-signup.route'
import logoutRouter from './API/authentication/routes/post-logout.route'
import postTelegramToken from './API/user/telegram-token/routes/put-telegram-token.router'
import putTelegramToken from './API/user/telegram-token/routes/put-telegram-token.router'
import authenticateRouter from './API/authentication/routes/authenticated.route'

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
import Logger from './infrastructure/logger'

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
// app.use(csrf())
app.use(passport.initialize())
app.use(passport.session())
// app.use(passport.authenticate('session'))

passportConfiguration()
app.use('/v1', signupRouter)
app.use('/v1', loginRouter)
app.use('/v1', logoutRouter)

app.use(function (req, res, next) {
  if (req.isAuthenticated()) {
    // Si el usuario está autenticado, continuar con la solicitud
    return next()
  }
  // Si el usuario no está autenticado, redirigir a la página de inicio de sesión
  res.redirect('/login')
})

app.use('/v1', getImagesRouter)
app.use('/v1', postTelegramToken)
app.use('/v1', putTelegramToken)
app.use('/v1', authenticateRouter)

app.use(function (req, res, next) {
  Logger.error('404 Not Found', req.originalUrl)
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

  // render the error page
  res.status(err.status || 500)
  // res.render('error')
  res.send(err)
})

// searchFile().catch(console.error)

kafkaConsumer().catch(console.error)
