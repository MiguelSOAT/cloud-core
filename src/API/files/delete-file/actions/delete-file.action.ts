import logger from '../../../../infrastructure/custom-logger'
import UserFiles from '../../../../models/user-files/user-files.model'
import { IUser } from '../../../../models/user/user'
import User from '../../../../models/user/user.model'
import DeleteFileFromDBService from '../services/delete-file-from-db.service'
import DeleteFileService from '../services/delete-file.service'

export default class DeleteFileAction {
  public static async invoke(
    sessionUser: IUser,
    fileId: number
  ): Promise<void> {
    logger.info('Deleting user file')
    if (!sessionUser.id) {
      logger.error('User id is undefined')
      throw new Error('User id is undefined')
    }
    const userFiles: UserFiles = new UserFiles(
      sessionUser.id
    )
    const file = await userFiles.findByFileId(fileId)
    await userFiles.findByFileUUID(file?.uuid || '')
    logger.verbose('Deleting file from DB', {
      userFiles: userFiles.files
    })
    const user: User = new User()
    await user.findById(sessionUser.id)

    await DeleteFileService.execute(user, userFiles)
    await DeleteFileFromDBService.execute(fileId, userFiles)
  }
}
