import MYSQLDB from '../mysqldb/mysqldb.model'
import {
  IUserFilesDBData,
  IUserFiles,
  IFile,
  IFileBase
} from './user-files'

export default class UserFiles
  extends MYSQLDB<IUserFilesDBData>
  implements IUserFiles
{
  public userId: number
  public files: IFile[]
  table = 'USER_FILES'

  constructor(userId: number) {
    super()
    this.userId = userId
    this.files = []
  }

  public async findByUserId(
    page?: number,
    pageSize?: number,
    size?: number
  ): Promise<IUserFilesDBData | null> {
    const values = ['*']
    const conditions = ['userId']
    const conditionsValues = [this.userId]
    let limitOffset = ''

    if (page && pageSize) {
      const offset = (page - 1) * pageSize
      const limit = pageSize
      limitOffset = `${offset}, ${limit}`
    }

    let customConditions
    if (size) {
      customConditions = ['size in (0,?)']
      conditionsValues.push(size)
    }

    const orderBy = 'createdAt'
    const ascOrDesc = 'DESC'
    const groupBy = ['size']
    const dbData: IUserFilesDBData[] = await super.select(
      this.table,
      values,
      conditions,
      conditionsValues,
      customConditions,
      groupBy,
      orderBy,
      ascOrDesc,
      limitOffset
    )

    this.setUserFilesFromDbResponse(dbData)

    return dbData[0] || null
  }

  public async findByFileId(
    fileId: number
  ): Promise<IUserFilesDBData | null> {
    const values = ['*']
    const conditions = ['id', 'userId']
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

  public async findByFileUUID(
    uuid: string,
    sizes: number[] = [0, 1, 2, 3]
  ): Promise<IUserFilesDBData | null> {
    const values = ['*']
    const conditions = ['uuid', 'userId']
    const conditionsValues = [uuid, this.userId]
    const customConditions = [
      `size in (${sizes.join(',')})`
    ]
    const dbData: IUserFilesDBData[] = await super.select(
      this.table,
      values,
      conditions,
      conditionsValues,
      customConditions
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

  public async insertNewFile(
    file: IFileBase
  ): Promise<void> {
    const keys = [
      'userId',
      'fileName',
      'fileSize',
      'fileType',
      'fileExtension',
      'uuid',
      'size',
      'origin'
    ]
    const values = [
      this.userId,
      file.fileName,
      file.fileSize,
      file.fileType,
      file.fileExtension,
      file.uuid,
      file.size,
      file.origin
    ]
    await super.insert(this.table, keys, values)
  }

  public async deleteFileById(
    fileId: number
  ): Promise<void> {
    const conditions = ['id', 'userId']
    const conditionsValues = [fileId, this.userId]
    await super.delete(
      this.table,
      conditions,
      conditionsValues
    )
  }

  private setUserFilesFromDbResponse(
    dbData: IUserFilesDBData[]
  ): void {
    if (dbData.length > 0) {
      this.userId = dbData[0].userId
      this.files = []
      for (const file of dbData) {
        this.files.push({
          id: file.id,
          fileName: file.fileName,
          fileSize: file.fileSize,
          fileType: file.fileType,
          fileExtension: file.fileExtension,
          uuid: file.uuid,
          size: file.size,
          origin: file.origin
        })
      }
    }
  }
}
