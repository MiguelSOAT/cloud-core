import express from 'express'
import GetFilesAction from '../actions/get-files.action'
import { IUser } from '../../../../models/user/user'

const router = express.Router()

router.get('/files', async (req, res) => {
  const user: IUser | undefined = req.user
  const page: any = req.query.page
  const pageSize: any = req.query.pageSize

  if (!user) {
    res.status(401).json({
      message: 'Unauthorized'
    })
    return
  }

  const getFilesResponse: IGetFile[] =
    await GetFilesAction.invoke(
      user,
      parseInt(page) || 1,
      parseInt(pageSize) || 10
    )

  res.header('Access-Control-Allow-Origin', '*')
  res.json({
    images: getFilesResponse
  })
})

export default router
