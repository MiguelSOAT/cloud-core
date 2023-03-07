import express from 'express'
import passport from 'passport'

const router = express.Router()

router.get('/login/password', async (_req, res) => {
  passport.authenticate('local', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/login',
    failureMessage: true
  })
})

export default router
