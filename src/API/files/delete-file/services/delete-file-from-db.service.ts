import { IFile } from '../../../../models/user-files/user-files'
import UserFiles from '../../../../models/user-files/user-files.model'
import { Db } from 'mongodb'
import MongoDBConnection from '../../../../infrastructure/mongodb-connection'
import Logger from '../../../../infrastructure/custom-logger'

export default class DeleteFileFromDBService {
  public static async execute(
    fileId: number,
    userFiles: UserFiles
  ): Promise<void> {
    const files: IFile[] = userFiles.files
    const mongoClient: MongoDBConnection =
      new MongoDBConnection()
    const mongoDB: Db = await mongoClient.connect()

    for (const file of files) {
      await userFiles.deleteFileById(fileId)
      await this.deleteFileFromMongoDB(file, mongoDB)
      await userFiles.deleteFileById(file.id)
    }

    await mongoClient.disconnect()
  }

  private static async deleteFileFromMongoDB(
    file: IFile,
    mongoDB: Db
  ) {
    Logger.info('Deleting file from MongoDB')
    if (file.size === 3 || file.size === 0) {
      await mongoDB.collection('files').deleteOne({
        fileId: file.id
      })

      Logger.verbose('File deleted from MongoDB', {
        file
      })
    }
  }
}
