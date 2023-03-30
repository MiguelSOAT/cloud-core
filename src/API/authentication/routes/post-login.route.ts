import express from 'express'
import passport from 'passport'
import Logger from '../../../infrastructure/logger'
import { IUserDBData } from '../../../models/user/user'
import User from '../../../models/user/user.model'
const router = express.Router()

router.post(
  '/login/password',
  passport.authenticate('local', {
    failureRedirect: '/login'
  }),
  (_req, res) => {
    res.redirect('/')
  }
)

export default router
