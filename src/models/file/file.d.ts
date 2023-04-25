export interface IImportFile {
  file_path: string
  file_name: string
  file_size: number
  mime_type: string
  uuid: string
  file_extension: string
  size: number
}

export interface IKafkaFile extends IImportFile {
  file_id: string
  update_id: number
  telegram_token: number
}
