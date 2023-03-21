import MYSQLDB from '../mysqldb/mysqldb.model'
import {
  IUserFilesDBData,
  IUserFiles,
  IFile
} from './user-files'

export default class UserFiles
  extends MYSQLDB<IUserFilesDBData>
  implements IUserFiles
{
  userId: number
  files: IFile[]
  table = 'USER_FILES'

  constructor(userId: number) {
    super()
    this.userId = userId
    this.files = []
  }

  public async findByUserId(): Promise<IUserFilesDBData | null> {
    const values = ['*']
    const conditions = ['userId']
    const conditionsValues = [this.userId]
    const dbData: IUserFilesDBData[] = await super.select(
      this.table,
      values,
      conditions,
      conditionsValues
    )

    this.setUserFilesFromDbResponse(dbData)

    return dbData[0] || null
  }

  public async findByFileId(
    fileId: string
  ): Promise<IUserFilesDBData | null> {
    const values = ['*']
    const conditions = ['fileId', 'userId']
    const conditionsValues = [fileId, this.userId]
    const dbData: IUserFilesDBData[] = await super.select(
      this.table,
      values,
      conditions,
      conditionsValues
    )

    this.setUserFilesFromDbResponse(dbData)

    return dbData[0] || null
  }

  public async deleteByFileId(
    fileId: string
  ): Promise<void> {
    const conditions = ['fileId', 'userId']
    const conditionsValues = [fileId, this.userId]
    await super.delete(
      this.table,
      conditions,
      conditionsValues
    )
  }

  public setUserFileDataFromDB(
    userFiles: IUserFiles | null
  ) {
    if (userFiles) {
      this.userId = userFiles.userId
      this.files = userFiles.files
    }
  }

  public async insertNewFile(file: IFile): Promise<void> {
    const keys = [
      'userId',
      'fileName',
      'fileSize',
      'fileType',
      'fileExtension',
      'uuid'
    ]
    const values = [
      this.userId,
      file.fileName,
      file.fileSize,
      file.fileType,
      file.fileExtension,
      file.uuid
    ]
    await super.insert(this.table, keys, values)
  }

  private setUserFilesFromDbResponse(
    dbData: IUserFilesDBData[]
  ): IUserFiles | null {
    let userFiles: IUserFiles | null = null
    if (dbData.length > 0) {
      userFiles = {
        userId: dbData[0].userId,
        files: []
      }
      for (const file of dbData) {
        userFiles.files.push({
          id: file.id,
          fileName: file.fileName,
          fileSize: file.fileSize,
          fileType: file.fileType,
          fileExtension: file.fileExtension,
          uuid: file.uuid
        })
      }
    }

    return userFiles
  }
}
