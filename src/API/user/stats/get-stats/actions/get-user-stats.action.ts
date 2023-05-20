import { IUserStats } from '../..'
import CustomLogger from '../../../../../infrastructure/custom-logger'
import { IUser } from '../../../../../models/user/user'
import GetUserStatsService from '../services/get-user-stats.service'

export default class GetUserStatsAction {
  public static async invoke(
    user: IUser
  ): Promise<IUserStats> {
    CustomLogger.info('Retrieving user stats')

    const userStats: IUserStats =
      await GetUserStatsService.execute(user)

    CustomLogger.info('User stats retrieved')

    return userStats
  }
}
