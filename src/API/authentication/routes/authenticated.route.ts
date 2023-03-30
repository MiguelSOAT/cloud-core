import express from 'express'
const router = express.Router()

router.post('/authenticate', (_req, res) => {
  res.send('OK')
})
export default router
