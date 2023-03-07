import express from 'express'
import EncryptPasswordService from '../services/post-signup/encrypt-password.service'
import CreateNewUserService from '../services/post-signup/create-new-user.service'
import {
  INewUserData,
  ISignupResponse
} from '../interfaces/authentication'
import logger from '../infrastructure/logger'

const router = express.Router()

router.post('/signup', async (req, res) => {
  const username = req.body.username
  const password = req.body.password
  const newUserData: INewUserData =
    await EncryptPasswordService.execute(username, password)
  const response: ISignupResponse =
    await CreateNewUserService.execute(newUserData)

  logger.verbose('User creation result', {
    response
  })
  if (!response.ok) {
    res.status(response.code || 500).send({
      errorMessage:
        response.message || 'Internal server error'
    })
  }

  res.status(200).send()
})

export default router
