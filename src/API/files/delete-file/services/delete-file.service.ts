import fs from 'fs'
import { IFile } from '../../../../models/user-files/user-files'
import Logger from '../../../../infrastructure/custom-logger'
import UserFiles from '../../../../models/user-files/user-files.model'
import User from '../../../../models/user/user.model'

export default class DeleteFileService {
  public static async execute(
    user: User,
    userFiles: UserFiles
  ): Promise<void> {
    const filePath = `${process.env.FILES_DIRECTORY}/${user.username}`
    const files: IFile[] = userFiles.files

    for (const file of files) {
      const fileName = file.fileName
      const fileDirectory = `${filePath}/${fileName}`

      fs.unlink(fileDirectory, (err) => {
        if (err) {
          Logger.error('Error deleting file', {
            file,
            files
          })
          throw new Error('Error deleting file')
        }
        Logger.verbose('File deleted', { fileDirectory })
      })
    }
  }
}
