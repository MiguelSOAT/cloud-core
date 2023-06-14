import { IFile } from '../../../../../models/user-files/user-files'

export default class GetFilesDomain implements IGetFile {
  public file_name: string
  public file_base64: string
  public extension: string
  public hasPreview: boolean
  public fileId: number
  public fileSize: number
  public origin: string

  constructor(
    file: IFile,
    fileData: string,
    isImage: boolean
  ) {
    this.file_name = file.fileName
    this.file_base64 = fileData
    this.hasPreview = isImage
    this.fileId = file.id
    this.fileSize = file.originalSize || 0
    this.extension = file.fileExtension
    this.origin = file.origin
  }
}
