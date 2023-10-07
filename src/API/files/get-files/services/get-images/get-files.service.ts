import fs from 'fs'
import GetFilesDomain from '../../domains/get-images/get-files.domain'
import logger from '../../../../../infrastructure/custom-logger'
import {
  IUserFiles,
  IFile
} from '../../../../../models/user-files/user-files'
import { IUser } from '../../../../../models/user/user'

export default class GetFilesService {
  public static async execute(
    user: IUser,
    userFiles: IUserFiles
  ): Promise<IGetFile[]> {
    logger.verbose('Getting user files', { userFiles })
    if (!userFiles.files) return []
    const files: IGetFile[] = []
    const path = `${process.env.FILES_DIRECTORY || ''}/${
      user.username
    }/`

    for (const file of userFiles.files) {
      const filePath = `${path}${file.fileName}`
      const isImage = this.isImage(file)
      const fileData: string = isImage
        ? this.toBase64(filePath)
        : ''
      const getFileObject: IGetFile = new GetFilesDomain(
        file,
        fileData,
        isImage
      )
      files.push(getFileObject)
    }

    return files
  }

  public static isImage(file: IFile): boolean {
    const previewExtensions = [
      'jpg',
      'jpeg',
      'png',
      // 'gif',
      // 'bmp',
      // 'svg',
      // 'tiff',
      // 'raw',
      'webp',
      'pdf'
    ]

    const fileExtension =
      file.fileExtension.toLocaleLowerCase()
    return previewExtensions.includes(fileExtension)
  }
  public static toBase64(filePath: string): string {
    const bitmap = fs.readFileSync(filePath)
    return Buffer.from(bitmap).toString('base64')
  }
}
