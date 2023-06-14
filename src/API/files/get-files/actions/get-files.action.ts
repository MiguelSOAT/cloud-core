import logger from '../../../../infrastructure/custom-logger'
import { IUserFilesDBData } from '../../../../models/user-files/user-files'
import UserFiles from '../../../../models/user-files/user-files.model'
import { IUser } from '../../../../models/user/user'
import GetFilesService from '../services/get-images/get-files.service'

export default class GetFilesAction {
  public static async invoke(
    user: IUser,
    page: number,
    pageSize: number
  ): Promise<IGetFile[]> {
    logger.info('Getting user files')
    if (!user.id) {
      logger.error('User id is undefined')
      return []
    }
    const userFiles = new UserFiles(user.id)
    const files: IUserFilesDBData | null =
      await userFiles.findByUserId(page, pageSize, 2)
    logger.verbose('User files found', { files })
    const images: IGetFile[] =
      await GetFilesService.execute(user, userFiles)
    return images
  }
}
