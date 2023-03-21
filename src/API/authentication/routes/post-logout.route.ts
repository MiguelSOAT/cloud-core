import express from 'express'
const router = express.Router()

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
