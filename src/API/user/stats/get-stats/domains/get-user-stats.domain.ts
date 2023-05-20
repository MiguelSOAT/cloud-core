import { IFileMongoDB } from '../../../../../models/user-files/user-files'
import {
  IUserStats,
  IUserStatsFileType,
  IUserStatsSource,
  IUserStatsStorage,
  fileType,
  source
} from '../../index'

export default class GetUserStatsDomain
  implements IUserStats
{
  public storage: IUserStatsStorage
  public fileTypes: Record<fileType, IUserStatsFileType>
  public sourceStats: Record<source, IUserStatsSource>

  constructor(userFiles: IFileMongoDB[]) {
    this.storage = this.getStorage(userFiles)
    this.fileTypes = this.getFileTypes(userFiles)
    this.sourceStats = this.getSourceStats(userFiles)
  }

  private getStorage(
    userFiles: IFileMongoDB[]
  ): IUserStatsStorage {
    const storage: IUserStatsStorage = {
      used: 0,
      total: 5e9
    }

    for (const file of userFiles) {
      storage.used += file.originalSize
    }

    return storage
  }

  private getFileTypes(
    userFiles: IFileMongoDB[]
  ): Record<fileType, IUserStatsFileType> {
    const fileTypes: Record<fileType, IUserStatsFileType> =
      {}

    for (const file of userFiles) {
      const fileExtension = file.fileExtension

      if (!fileTypes[fileExtension]) {
        fileTypes[fileExtension] = {
          count: 0,
          size: 0
        }
      }

      fileTypes[fileExtension].count++
      fileTypes[fileExtension].size += file.originalSize
    }

    return fileTypes
  }

  private getSourceStats(
    userFiles: IFileMongoDB[]
  ): Record<source, IUserStatsSource> {
    const sourceStats: Record<source, IUserStatsSource> = {}
    let totalCount = 0
    for (const file of userFiles) {
      const source = file.origin
      totalCount++

      if (!sourceStats[source]) {
        sourceStats[source] = {
          count: 0,
          size: 0,
          percentage: 0
        }
      }

      sourceStats[source].count++
      sourceStats[source].size += file.originalSize
    }

    for (const source in sourceStats) {
      sourceStats[source].percentage =
        (sourceStats[source].count / totalCount) * 100
    }

    return sourceStats
  }
}
