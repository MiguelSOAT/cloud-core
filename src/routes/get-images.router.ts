import express from 'express'
import GetImagesAction from '../actions/get-images.action'
import { ensureLoggedIn } from 'connect-ensure-login'

const router = express.Router()

router.get('/', async (req, res) => {
  console.log(req.user)
  console.log(req.isAuthenticated())
  const getImagesResponse: Iimage[] =
    await GetImagesAction.invoke()

  res.header('Access-Control-Allow-Origin', '*')
  res.json({
    images: getImagesResponse
  })
})

export default router
