import { IRouteResponse } from '../../../../types'

export default class CheckUploadRequirementsDomain
  implements IRouteResponse
{
  public ok: boolean
  public message: string

  private maxFileSize = parseInt(
    process.env.MAX_FILE_SIZE || '10000000'
  )
  private maxUploadFiles = parseInt(
    process.env.MAX_UPLOAD_FILES || '5'
  )

  constructor(filesUpload: IFileUpload[]) {
    this.ok = true
    this.message = 'File uploaded successfully'

    this.isValidUpload(filesUpload)
  }

  private isValidUpload(filesUpload: IFileUpload[]) {
    let totalFilesSize = 0
    this.isInvalidFileNumber(filesUpload.length)

    for (const fileUpload of filesUpload) {
      totalFilesSize += fileUpload.size
      this.isInvalidFileSize(fileUpload)

      if (!this.ok) break
    }
  }

  private isInvalidFileSize(fileUpload: IFileUpload) {
    if (fileUpload.size > this.maxFileSize) {
      this.ok = false
      this.message = `File ${
        fileUpload.filename
      } is invalid.  Max file size is ${
        this.maxFileSize / 1e6
      }MB.`
    }
  }

  private isInvalidFileNumber(filesUploadLength: number) {
    if (filesUploadLength > this.maxUploadFiles) {
      this.ok = false
      this.message = `Max number of files is ${this.maxUploadFiles}.`
    }
  }
}
