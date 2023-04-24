import sharp from 'sharp'
import {
  IFileBase,
  IFileMongoDB
} from '../user-files/user-files'
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
import MongoDBConnection from '../../infrastructure/mongodb-connection'

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

  static async saveInMysqlDB(
    file: IFile,
    user: User | undefined,
    origin: string
  ): Promise<number | undefined> {
    let fileId: undefined | number = undefined
    if (user?.id) {
      const userFiles = new UserFiles(user.id)
      fileId = await userFiles.insertNewFile({
        fileName: file.uuid,
        fileSize: file.file_size,
        fileType: file.mime_type,
        fileExtension: file.file_extension,
        uuid: file.uuid,
        size: file.size,
        origin: origin,
        originalSize: file.file_size
      })
    }

    return fileId
  }

  static async saveInMongoDB(
    file: IFile,
    user: User | undefined,
    origin: string,
    fileId?: number
  ) {
    if (user?.id) {
      const fileData: IFileMongoDB = {
        fileName: file.uuid,
        fileSize: file.file_size,
        fileType: file.mime_type,
        fileExtension: file.file_extension,
        uuid: file.uuid,
        size: file.size,
        origin: origin,
        userId: user.id,
        fileId: fileId || 0,
        originalSize: file.file_size
      }

      const mongoClient = new MongoDBConnection()
      const db = await mongoClient.connect()
      await db.collection('files').insertOne(fileData)
      await mongoClient.disconnect()
    }
  }

  static async processRawImage(
    file: IFile,
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
        file,
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
    file: IFile,
    user: User | undefined,
    size: number,
    relativeSize: number,
    origin: string,
    originalSize: number = file.file_size
  ): Promise<IFileBase> {
    const userDirectory = `${process.env.PHOTOS_DIRECTORY}${user?.username}/`
    const fileName = file.uuid
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
      fileType: file.mime_type,
      fileExtension: 'png',
      uuid: file.uuid,
      size: relativeSize,
      origin: origin,
      originalSize: originalSize
    }
  }

  static async saveTelegramDownloadedFile(
    file: IKafkaFile,
    response: AxiosResponse<any, any>,
    userData: User | undefined,
    userDirectory: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const fileName = file.uuid

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

    const fileName = `${file.uuid}`
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

  static isResizable = (file: IFile): boolean => {
    return (
      file.size === 0 &&
      File.imageExtensions.includes(file.file_extension)
    )
  }

  static async processSavedFile(
    isSaved: boolean,
    file: IFile,
    user: User | undefined,
    origin: string
  ): Promise<void> {
    if (isSaved) {
      const isAResizableImage = File.isResizable(file)

      if (isAResizableImage) {
        const fixSize = 3
        file.size = fixSize
        const fileId = await File.saveInMysqlDB(
          file,
          user,
          origin
        )
        await File.saveInMongoDB(file, user, origin, fileId)
        await File.processRawImage(file, user, origin)
      } else {
        const fileId = await File.saveInMysqlDB(
          file,
          user,
          origin
        )
        await File.saveInMongoDB(file, user, origin, fileId)
      }
    }
  }
}
