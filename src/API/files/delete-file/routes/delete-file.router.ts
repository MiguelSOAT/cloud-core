import express from 'express'
import DeleteFileAction from '../actions/delete-file.action'
import { IUser } from '../../../../models/user/user'

const router = express.Router()

router.delete('/file', async (req, res, next) => {
  const user: IUser | undefined = req.user
  const fileId: any = req.query.id

  if (!user) {
    res.status(401).json({
      message: 'Unauthorized'
    })
    return
  }

  await DeleteFileAction.invoke(user, fileId)

  return res.status(200).json({ ok: true })
})

export default router
