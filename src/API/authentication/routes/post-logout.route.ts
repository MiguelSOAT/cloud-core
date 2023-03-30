import express from 'express'
import logger from '../../../infrastructure/logger'
const router = express.Router()

router.post('/logout', function (req, res, next) {
  try {
    req.logOut({}, function (err) {
      if (err) {
        return next(err)
      }
      logger.info('User logged out')
      logger.info('User session destroyed')
      res.clearCookie('connect.sid')
      res.redirect('/')
    })
  } catch (error) {
    logger.error('Error while logging out', {
      error
    })
  }
})

export default router
