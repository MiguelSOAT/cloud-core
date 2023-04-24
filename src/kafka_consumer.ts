import axios, { AxiosResponse } from 'axios'
import { EachMessagePayload, Kafka } from 'kafkajs'
import logger from './infrastructure/logger'
import User from './models/user/user.model'
import UserTelegram from './models/user-telegram/user-telegram.model'
import fs from 'fs'
import File from './models/file/file.model'
import { IKafkaFile } from './models/file/file'

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['broker:9092']
})

const consumer = kafka.consumer({ groupId: 'test-group' })

const kafkaConsumer = async () => {
  await consumer.connect()
  await consumer.subscribe({
    topic: 'telegram',
    fromBeginning: true
  })

  await consumer.run({
    eachMessage: messageProcessor
  })
}

async function messageProcessor(
  kafkaJob: EachMessagePayload
): Promise<void> {
  const token: string | undefined =
    process.env.TELEGRAM_TOKEN
  const message = kafkaJob.message
  const object: IKafkaFile = message.value?.toString()
    ? JSON.parse(message.value.toString())
    : {}
  const filePath = object.file_path
  logger.verbose(`Downloading file from telegram`, {
    object
  })

  try {
    await downloadTelegramFile(filePath, token, object)
  } catch (error) {
    logger.error(
      `Error downloading telegram file: ${error}`,
      {
        url: `${process.env.TELEGRAM_FILE_DOWNLOAD_URL}${token}/${filePath}`
      }
    )
  }
}

const downloadTelegramFile = async (
  filePath: string,
  token: string | undefined,
  object: IKafkaFile
): Promise<void> => {
  const response = await axios.get(
    `${process.env.TELEGRAM_FILE_DOWNLOAD_URL}${token}/${filePath}`,
    {
      responseType: 'stream'
    }
  )

  const user: User | undefined =
    await getUserByTelegramToken(object.telegram_token)

  if (user?.id) {
    processDownloadedTelegramFile(user, object, response)
  }
}

const processDownloadedTelegramFile = async (
  user: User,
  object: IKafkaFile,
  response: AxiosResponse<any, any>
) => {
  const userDirectory = `${process.env.PHOTOS_DIRECTORY}${user.username}/`

  if (!fs.existsSync(userDirectory)) {
    logger.info(
      `Creating directory new directory: ${userDirectory}`
    )
    fs.mkdirSync(userDirectory, {
      recursive: true
    })
  }
  const isSaved = await File.saveTelegramDownloadedFile(
    object,
    response,
    user,
    userDirectory
  )

  await File.processSavedFile(
    isSaved,
    object,
    user,
    'telegram'
  )
}

const getUserByTelegramToken = async (
  telegramId: number
): Promise<User | undefined> => {
  const userTelegram = new UserTelegram()
  await userTelegram.findByTelegramId(telegramId)
  const user = new User()
  if (userTelegram.userId) {
    logger.info(`User found`)
    await user.findById(userTelegram.userId)
  }
  logger.verbose(`User`, {
    id: user.id,
    username: user.username
  })
  return user
}

export default kafkaConsumer
