import express from 'express'
import GetImagesAction from '../actions/get-images.action'
import passport from 'passport'

const router = express.Router()

router.get(
  '/files',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const getImagesResponse: Iimage[] =
      await GetImagesAction.invoke()

    res.header('Access-Control-Allow-Origin', '*')
    res.json({
      images: getImagesResponse
    })
  }
)

export default router
