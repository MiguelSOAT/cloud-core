export interface telegramJobMessage {
  file_path: string
  file_id: string
  file_name: string
  file_size: number
  uuid: string
}

export type document = 'document'
export type photo = 'photo'
export type video = 'video'
export type audio = 'audio'

export type fileTypes = document | photo | video | audio

export interface documentData extends telegramJobMessage {
  user_id: string
  extension: string
  fileType: fileTypes
}
