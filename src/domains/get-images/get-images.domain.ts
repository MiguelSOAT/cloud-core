export default class GetImagesDomain implements Iimage {
  public file_name: string
  public file_base64: string
  public extension: string

  constructor(fileName: string, fileData: string) {
    this.file_name = fileName
    this.file_base64 = fileData
    this.extension = this._getFileExtension(fileName)
  }

  private _getFileExtension(fileName: string) {
    return fileName.split('.').pop()?.toUpperCase() || ''
  }
}
