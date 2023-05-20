export interface IUserStatsFileType {
  count: number
  size: number
}

export interface IUserStatsStorage {
  used: number
  total: number
}

export interface IUserStatsSource {
  count: number
  size: number
  percentage: number
}

export type fileType = string
export type source = string
export interface IUserStats {
  storage: IUserStatsStorage
  fileTypes: Record<fileType, IUserStatsFileType>
  sourceStats: Record<source, IUserStatsSource>
}
