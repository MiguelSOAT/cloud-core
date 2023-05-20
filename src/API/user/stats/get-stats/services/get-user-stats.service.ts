import { IUserStats } from '../..'
import CustomLogger from '../../../../../infrastructure/custom-logger'
import MongoDBConnection from '../../../../../infrastructure/mongodb-connection'
import { IFileMongoDB } from '../../../../../models/user-files/user-files'
import { IUser } from '../../../../../models/user/user'
import GetUserStatsDomain from '../domains/get-user-stats.domain'

export default class GetUserStatsService {
  public static async execute(user: IUser) {
    CustomLogger.info('Retrieving user stats from DB')

    const mongoClient = new MongoDBConnection()
    const db = await mongoClient.connect()
    const userFiles: IFileMongoDB[] | undefined = (await db
      .collection('files')
      .find({
        userId: user.id
      })
      .toArray()) as unknown as IFileMongoDB[]

    const userStats: IUserStats = new GetUserStatsDomain(
      userFiles
    )

    await mongoClient.disconnect()
    CustomLogger.info('User stats retrieved from DB')

    return userStats
  }
}
