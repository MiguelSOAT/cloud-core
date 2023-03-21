import express from 'express'
import User from '../../../models/user/user.model'

const router = express.Router()

router.post('/signup', async (req, res) => {
  const username = req.body.username
  const password = req.body.password

  try {
    const user = new User(username)
    user.create(password)

    res.status(200).send()
  } catch (e) {
    res.status(500).send()
  }
})

export default router
