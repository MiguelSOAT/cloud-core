import express from 'express'
import passport from 'passport'
import MYSQLDB from '../infrastructure/mysqldb'
import crypto from 'node:crypto'
import Logger from '../infrastructure/logger'
import { ensureLoggedIn } from 'connect-ensure-login'
const LocalStrategy = require('passport-local')
const router = express.Router()

// router.use(ensureLoggedIn())

router.post('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err)
    }
    res.send({
      status: 'success'
    })
  })
})

export default router
