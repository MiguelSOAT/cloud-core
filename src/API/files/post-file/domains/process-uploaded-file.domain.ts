import { v4 as uuidv4 } from 'uuid'
import { IImportFile } from '../../../../models/file/file'
export default class ProcessUploadedFileDomain
  implements IImportFile
{
  public file_path: string
  public file_name: string
  public file_size: number
  public mime_type: string
  public uuid: string
  public file_extension: string
  public size = 0

  constructor(fileUpload: IFileUpload) {
    const uuid: string = this.generateUUID()
    const fileExtension: string =
      fileUpload.mimetype.split('/').pop() || ''
    this.file_path = fileUpload.path
    this.file_name = fileUpload.filename
    this.file_size = fileUpload.size
    this.mime_type = fileUpload.mimetype
    this.uuid = uuid
    this.file_extension = fileExtension
  }

  private generateUUID(): string {
    return uuidv4()
  }
}
