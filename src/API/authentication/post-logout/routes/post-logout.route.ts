import express from 'express'
import CustomLogger from '../../../../infrastructure/custom-logger'
const router = express.Router()

router.post('/logout', function (req, res, next) {
  try {
    req.logOut({}, function (err) {
      if (err) {
        return next(err)
      }
      CustomLogger.info('User logged out')
      CustomLogger.info('User session destroyed')
      res.clearCookie('connect.sid')
      res.redirect('/')
    })
  } catch (error) {
    CustomLogger.error('Error while logging out', {
      error
    })
  }
})

export default router
