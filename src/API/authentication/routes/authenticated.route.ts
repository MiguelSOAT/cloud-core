import express from 'express'
import passport from 'passport'
const router = express.Router()

router.post('/authenticate', (_req, res) => {
  res.send('OK')
})
export default router
