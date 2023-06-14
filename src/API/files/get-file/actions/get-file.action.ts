import logger from '../../../../infrastructure/custom-logger'
import UserFiles from '../../../../models/user-files/user-files.model'
import { IUser } from '../../../../models/user/user'
import User from '../../../../models/user/user.model'

export default class GetFileAction {
  public static async invoke(
    sessionUser: IUser,
    fileId: number
  ): Promise<IDownloadFile | null> {
    logger.info('Downloading user file')
    if (!sessionUser.id) {
      logger.error('User id is undefined')
      return null
    }
    const userFiles = new UserFiles(sessionUser.id)
    const file = await userFiles.findByFileId(fileId)
    const rawFile = await userFiles.findByFileUUID(
      file?.uuid || '',
      [0, 3]
    )

    const user = new User()
    await user.findById(sessionUser.id)

    let fileDirectory: IDownloadFile | null = null
    if (rawFile) {
      const filePath = `${process.env.FILES_DIRECTORY}${user.username}`
      const fileName = rawFile.fileName
      logger.verbose('User files found', { rawFile })
      fileDirectory = {
        filePath,
        fileName,
        originalFileName: `${fileName}.${rawFile.fileExtension}`
      }
    }

    return fileDirectory
  }
}
