import express from 'express'
import passport from 'passport'
const router = express.Router()

router.post(
  '/login/password',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }),
  (req, res, next) => {
    req.session.save((err) => {
      if (err) {
        return next(err)
      }
      res.redirect('/')
    })
  }
)

export default router
