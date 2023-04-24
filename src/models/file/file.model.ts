import sharp from 'sharp'
import { IFileBase } from '../user-files/user-files'
import UserFiles from '../user-files/user-files.model'
import User from '../user/user.model'
import { AxiosResponse } from 'axios'
import fs, {
  WriteStream,
  createWriteStream,
  fstat
} from 'fs'
import logger from '../../infrastructure/logger'
import { IFile, IKafkaFile } from './file'
import { IUser } from '../user/user'

export default class File {
  static imageExtensions: string[] = [
    'jpg',
    'jpeg',
    'png',
    'webp'
    // 'gif',
    // 'bmp',
    // 'svg',
    // 'tiff',
    // 'raw',
  ]

  static async saveInDB(
    object: IFile,
    user: User | undefined,
    origin: string
  ) {
    if (user?.id) {
      const userFiles = new UserFiles(user.id)
      await userFiles.insertNewFile({
        fileName: object.file_name,
        fileSize: object.file_size,
        fileType: object.mime_type,
        fileExtension: object.file_extension,
        uuid: object.uuid,
        size: object.size,
        origin: origin
      })
    }
  }

  static async processRawImage(
    object: IFile,
    user: User | undefined,
    origin: string
  ) {
    if (!user?.id)
      throw new Error(
        'Error while processing image, user not found'
      )
    const sizes = [
      {
        size: 90,
        relativeSize: 1
      },
      {
        size: 320,
        relativeSize: 2
      }
    ]

    for (const size of sizes) {
      const resizedImageData = await this.resizeImage(
        object,
        user,
        size.size,
        size.relativeSize,
        origin
      )

      const userFiles = new UserFiles(user.id)
      await userFiles.insertNewFile(resizedImageData)
    }
  }

  static async resizeImage(
    object: IFile,
    user: User | undefined,
    size: number,
    relativeSize: number,
    origin: string
  ): Promise<IFileBase> {
    const userDirectory = `${process.env.PHOTOS_DIRECTORY}${user?.username}/`
    const fileName = object.file_name
    const resizedFileName = `resized_${size}_${fileName}`
    const filePath = `${userDirectory}${fileName}`
    const resizedFilePath = `${userDirectory}${resizedFileName}`

    const resizedImage = await sharp(filePath)
      .resize({
        width: size,
        height: size,
        fit: sharp.fit.outside
      })
      .png()
      .toFile(resizedFilePath)

    return {
      fileName: resizedFileName,
      fileSize: resizedImage.size,
      fileType: object.mime_type,
      fileExtension: 'png',
      uuid: object.uuid,
      size: relativeSize,
      origin: origin
    }
  }

  static async saveTelegramDownloadedFile(
    object: IKafkaFile,
    response: AxiosResponse<any, any>,
    userData: User | undefined,
    userDirectory: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const fileName = object.file_name

      if (userData) {
        const writer: WriteStream = createWriteStream(
          `${userDirectory}${fileName}`
        )

        response.data.pipe(writer)
        let error: null | any = null
        writer.on('error', (err: any) => {
          logger.error(`ERROR writing file: ${err}`)
          error = err
          writer.close()
          reject(err)
        })
        writer.on('close', () => {
          if (!error) {
            resolve(true)
          }
        })
      } else {
        reject(new Error('User not found'))
      }
    })
  }

  static async saveWebAppFile(user: IUser, file: IFile) {
    const sourceFile = file.file_path
    const userDirectory = `${process.env.PHOTOS_DIRECTORY}${user.username}/`

    if (!fs.existsSync(userDirectory)) {
      fs.mkdirSync(userDirectory)
    }

    const fileName = file.file_name
    const destinationPath = `${userDirectory}${fileName}`

    fs.copyFile(
      sourceFile,
      destinationPath,
      async (err) => {
        let isSaved = false
        if (!err) {
          logger.info('File was copied to destination')
          isSaved = true
        }

        if (user?.id) {
          const userInstance = new User()
          await userInstance.findById(user.id)
          await File.processSavedFile(
            isSaved,
            file,
            userInstance,
            'webapp'
          )
        }
      }
    )
  }

  static isResizable = (object: IFile): boolean => {
    return (
      object.size === 0 &&
      File.imageExtensions.includes(object.file_extension)
    )
  }

  static async processSavedFile(
    isSaved: boolean,
    object: IFile,
    user: User | undefined,
    origin: string
  ): Promise<void> {
    if (isSaved) {
      const isAResizableImage = File.isResizable(object)

      if (isAResizableImage) {
        const fixSize = 3
        object.size = fixSize
        await File.saveInDB(object, user, origin)
        await File.processRawImage(object, user, origin)
      } else {
        await File.saveInDB(object, user, origin)
      }
    }
  }
}
