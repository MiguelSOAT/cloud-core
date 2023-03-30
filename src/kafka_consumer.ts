import axios, { AxiosResponse } from 'axios'
import { createWriteStream, WriteStream } from 'fs'
import { EachMessagePayload, Kafka } from 'kafkajs'
import logger from './infrastructure/logger'
import User from './models/user/user.model'
import UserTelegram from './models/user-telegram/user-telegram.model'
import UserFiles from './models/user-files/user-files.model'
import fs from 'fs'

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['broker:9092']
})

const consumer = kafka.consumer({ groupId: 'test-group' })

const saveDownloadedFile = (
  object: any,
  response: AxiosResponse<any, any>,
  userData: User | undefined,
  userDirectory: string
) => {
  return new Promise((resolve, reject) => {
    const fileName = object.file_name

    if (userData) {
      const writer: WriteStream = createWriteStream(
        `${userDirectory}${fileName}`
      )

      response.data.pipe(writer)
      let error: null | any = null
      writer.on('error', (err: any) => {
        logger.error(`ERROR writing file: ${err}`)
        error = err
        writer.close()
        reject(err)
      })
      writer.on('close', () => {
        if (!error) {
          resolve(true)
        }
      })
    } else {
      reject(new Error('User not found'))
    }
  })
}

const kafkaConsumer = async () => {
  // Consuming
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
  const token = process.env.TELEGRAM_TOKEN
  const message = kafkaJob.message
  const object = message.value?.toString()
    ? JSON.parse(message.value.toString())
    : {}
  const filePath = object.file_path
  logger.verbose(`Downloading file from telegram`, {
    object
  })

  try {
    const response = await axios.get(
      `${process.env.TELEGRAM_FILE_DOWNLOAD_URL}${token}/${filePath}`,
      {
        responseType: 'stream'
      }
    )

    const user: User | undefined =
      await getUserByTelegramToken(object.telegram_token)
    if (user?.id) {
      const userDirectory = `${process.env.PHOTOS_DIRECTORY}${user.username}/`

      // check if directory exist else create directory
      if (!fs.existsSync(userDirectory)) {
        logger.info(
          `Creating directory new directory: ${userDirectory}`
        )
        fs.mkdirSync(userDirectory, {
          recursive: true
        })
      }
      const isSaved = await saveDownloadedFile(
        object,
        response,
        user,
        userDirectory
      )
      if (isSaved) {
        const userFiles = new UserFiles(user.id)
        await userFiles.insertNewFile({
          fileName: object.file_name,
          fileSize: object.file_size,
          fileType: object.mime_type,
          fileExtension: object.file_extension,
          uuid: object.uuid,
          size: object.size
        })
      }
    }
  } catch (error) {
    logger.error(
      `Error downloading telegram file: ${error}`,
      {
        url: `${process.env.TELEGRAM_FILE_DOWNLOAD_URL}${token}/${filePath}`
      }
    )
  }
}
const getUserByTelegramToken = async (
  telegramToken: string
): Promise<User | undefined> => {
  const userTelegram = new UserTelegram()
  await userTelegram.findByTelegramToken(telegramToken)
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
