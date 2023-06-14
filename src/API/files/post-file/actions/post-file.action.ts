import logger from '../../../../infrastructure/custom-logger'
import { IUser } from '../../../../models/user/user'
import { IRouteResponse } from '../../../../types'
import ProcessUploadedFileService from '../services/process-uploaded-file.service'

export default class PostFileAction {
  public static async invoke(
    sessionUser: IUser,
    filesUpload: IFileUpload[]
  ): Promise<IRouteResponse> {
    logger.info('Uploading user file')
    logger.verbose(`Hasta AQUI 2`)
    if (!sessionUser.id) {
      logger.error('User id is undefined')
      throw new Error('User id is undefined')
    }

    const response: IRouteResponse =
      await ProcessUploadedFileService.execute(
        sessionUser,
        filesUpload
      )

    return response
  }
}
