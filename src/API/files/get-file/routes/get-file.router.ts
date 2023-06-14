import express from 'express'
import GetFileAction from '../actions/get-file.action'
import createHttpError from 'http-errors'
import { IUser } from '../../../../models/user/user'
import Logger from '../../../../infrastructure/custom-logger'

const router = express.Router()

router.get('/file', async (req, res, next) => {
  const user: IUser | undefined = req.user
  const fileId: any = req.query.id

  if (!user) {
    res.status(401).json({
      message: 'Unauthorized'
    })
    return
  }

  const fileDirectory: IDownloadFile | null =
    await GetFileAction.invoke(user, fileId)

  if (!fileDirectory) {
    return next(createHttpError(404, 'File not found'))
  } else {
    res.download(
      `${fileDirectory.filePath}/${fileDirectory.fileName}`,
      fileDirectory.originalFileName
    )
  }
})

export default router
