interface IDownloadFile {
  filePath: string
  fileName: string
  originalFileName: string
}

interface IFileUpload {
  destination: string
  encoding: string
  fieldname: string
  filename: string
  mimetype: string
  originalname: string
  path: string
  size: number
}

interface IGetFile {
  file_name: string
  file_base64: string
  extension: string
  hasPreview: boolean
  fileSize: number
}
