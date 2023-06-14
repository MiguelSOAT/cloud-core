import { IUser } from '../../../../models/user/user'
import { IImportFile } from '../../../../models/file/file'
import File from '../../../../models/file/file.model'
import ProcessUploadedFileDomain from '../domains/process-uploaded-file.domain'
import { IRouteResponse } from '../../../../types'
import CheckUploadRequirementsDomain from '../domains/check-upload-requirements.domain'
import CustomLogger from '../../../../infrastructure/custom-logger'

export default class ProcessUploadedFileService {
  public static async execute(
    sessionUser: IUser,
    filesUpload: IFileUpload[]
  ): Promise<IRouteResponse> {
    CustomLogger.info('Uploading user file')
    if (!sessionUser.id) {
      CustomLogger.error('User id is undefined')
      throw new Error('User id is undefined')
    }
    CustomLogger.verbose(`Hasta AQUI 3`)
    const response: IRouteResponse =
      new CheckUploadRequirementsDomain(filesUpload)

    if (response.ok) {
      for (const fileUpload of filesUpload) {
        const file: IImportFile =
          new ProcessUploadedFileDomain(fileUpload)

        await File.saveWebAppFile(sessionUser, file)
      }
    }

    return response
  }
}
