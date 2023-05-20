import express from 'express'
import createHttpError from 'http-errors'
import CustomLogger from '../../../../../infrastructure/custom-logger'
import { IUser } from '../../../../../models/user/user'
import GetUserStatsAction from '../actions/get-user-stats.action'
import { IUserStats } from '../..'

const router = express.Router()
router.get('/user/stats', async (req, res, next) => {
  CustomLogger.info('Retrieving user stats')
  const user: IUser | undefined = req.user

  if (!user) {
    CustomLogger.error('User not found', req.user)
    return next(createHttpError(401, 'Unauthorized'))
  }

  const userStats: IUserStats =
    await GetUserStatsAction.invoke(user)

  CustomLogger.info('User stats retrieved successfully')

  res.send({
    userStats
  })
})

export default router
