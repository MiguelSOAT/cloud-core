import express from 'express'
import getImagesRouter from './routes/get-images.router'
import signupRouter from './routes/post-signup.router'
import loginRouter from './routes/post-login.route'
// import searchFile from './gdrive/get_files'
const app = express()
import kafkaConsumer from './kafka_consumer'
import env from 'dotenv'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import csrf from 'csurf'
import passport from 'passport'
import createError from 'http-errors'
import Logger from './infrastructure/logger'
const LocalStrategy = require('passport-local')
import logoutRouter from './routes/post-logout.route'
env.config()

// Router
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(
  session({
    secret: 'keyboard cat',
    resave: false, // don't save session if unmodified
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
  })
)
// app.use(csrf())
app.use(passport.initialize())
app.use(passport.session())
app.use(passport.authenticate('session'))

app.use(function (req, res, next) {
  console.log(req.body)
  const msgs = req.session.messages || []
  res.locals.messages = msgs
  res.locals.hasMessages = !!msgs.length
  req.session.messages = []
  next()
})
// app.use(function (req, res, next) {
//   res.locals.csrfToken = req.csrfToken()
//   next()
// })

app.use('/v1', getImagesRouter)
app.use('/v1', signupRouter)
app.use('/v1', loginRouter)
app.use('/v1', logoutRouter)

app.use(function (req, res, next) {
  // next(createError(404))
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
