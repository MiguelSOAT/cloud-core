import axios, { AxiosResponse } from 'axios'
import { EachMessagePayload, Kafka } from 'kafkajs'
import CustomLogger from './infrastructure/custom-logger'
import User from './models/user/user.model'
import UserTelegram from './models/user-telegram/user-telegram.model'
import fs from 'fs'
import File from './models/file/file.model'
import { IKafkaFile } from './models/file/file'
import { env } from 'process'

const broker = `${env.BROKER_DOMAIN}:${env.BROKER_PORT}`

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: [broker]
})

const consumer = kafka.consumer({ groupId: 'test-group' })

let ioSocket: any
const kafkaConsumer = async (io: any) => {
  await consumer.connect()
  await consumer.subscribe({
    topic: 'telegram',
    fromBeginning: true
  })
  ioSocket = io
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
  CustomLogger.verbose(`Downloading file from telegram`, {
    object
  })

  try {
    await downloadTelegramFile(filePath, token, object)
  } catch (error) {
    CustomLogger.error(
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
  file: IKafkaFile,
  response: AxiosResponse<any, any>
) => {
  const userDirectory = `${process.env.PHOTOS_DIRECTORY}${user.username}/`

  if (!fs.existsSync(userDirectory)) {
    CustomLogger.info(
      `Creating directory new directory: ${userDirectory}`
    )
    fs.mkdirSync(userDirectory, {
      recursive: true
    })
  }
  const isSaved = await File.saveTelegramDownloadedFile(
    file,
    response,
    user,
    userDirectory
  )

  await File.processSavedFile(
    isSaved,
    file,
    user,
    'telegram'
  )

  if (ioSocket) {
    ioSocket.emit('refreshFiles', user.username)
  }
}

const getUserByTelegramToken = async (
  telegramId: number
): Promise<User | undefined> => {
  const userTelegram = new UserTelegram()
  await userTelegram.findByTelegramId(telegramId)
  const user = new User()
  if (userTelegram.userId) {
    CustomLogger.info(`User found`)
    await user.findById(userTelegram.userId)
  }
  CustomLogger.verbose(`User`, {
    id: user.id,
    username: user.username
  })
  return user
}

export default kafkaConsumer
