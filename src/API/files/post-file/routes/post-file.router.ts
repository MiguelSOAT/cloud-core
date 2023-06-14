import express, {
  NextFunction,
  Request,
  Response
} from 'express'
import multer from 'multer'
import PostFileAction from '../actions/post-file.action'
import logger from '../../../../infrastructure/custom-logger'
import { IUser } from '../../../../models/user/user'
import { IRouteResponse } from '../../../../types'
import { io } from '../../../../serve'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.UPLOAD_DIRECTORY || './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

const upload = multer({ storage: storage })

const router = express.Router()

interface CustomResponse extends Response {
  routeResponse?: IRouteResponse
  username?: string
}

router.post(
  '/files',
  upload.array('files'),
  async (
    req: Request,
    res: CustomResponse,
    next: NextFunction
  ) => {
    logger.verbose(`Received file upload request`, {
      files: req.files
    })
    const user: IUser | undefined = req.user
    const filesUpload: IFileUpload[] =
      req.files as IFileUpload[]
    if (!user) {
      res.status(401).json({
        message: 'Unauthorized'
      })
      return
    }

    if (!req.files) {
      res.status(400).json({
        message: 'No file uploaded'
      })
      return
    }
    logger.verbose(`Hasta AQUI 1`, {
      files: req.files
    })
    const response: IRouteResponse =
      await PostFileAction.invoke(user, filesUpload)

    io.emit('refreshFiles', user.username)
    res.json(response)
  }
)

export default router
