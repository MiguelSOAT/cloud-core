export interface IFileBase {
  fileName: string
  fileSize: number
  fileType: string
  fileExtension: string
  uuid: string
  size: number
  origin: string
}
export interface IFile extends IFileBase {
  id: number
}

export interface IUserFiles {
  userId: number
  files: IFile[]
}

export interface IUserFilesDBData extends IFile {
  userId: number
}
