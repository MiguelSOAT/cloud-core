export interface IFile {
  id: number
  fileName: string
  fileSize: number
  fileType: string
  fileExtension: string
  uuid: string
}

export interface IUserFiles {
  userId: number
  files: IFile[]
}

export interface IUserFilesDBData extends IFile {
  userId: number
}
