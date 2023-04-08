import axios, { AxiosResponse } from 'axios'
import { createWriteStream, WriteStream } from 'fs'
import { EachMessagePayload, Kafka } from 'kafkajs'
import logger from './infrastructure/logger'
import User from './models/user/user.model'
import UserTelegram from './models/user-telegram/user-telegram.model'
import UserFiles from './models/user-files/user-files.model'
import fs from 'fs'
import sharp from 'sharp'
import { IFileBase } from './models/user-files/user-files'

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['broker:9092']
})

const consumer = kafka.consumer({ groupId: 'test-group' })

const imageExtensions = [
  'jpg',
  'jpeg',
  'png',
  // 'gif',
  // 'bmp',
  // 'svg',
  // 'tiff',
  // 'raw',
  'webp'
]

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
        if (
          object.size === 0 &&
          imageExtensions.includes(object.file_extension)
        ) {
          object.size = 3
          await saveFile(object, user)
          await processRawImage(object, user)
        } else {
          await saveFile(object, user)
        }
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

const saveFile = async (
  object: any,
  user: User | undefined
) => {
  if (user?.id) {
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

const processRawImage = async (
  object: any,
  user: User | undefined
) => {
  if (!user?.id)
    throw new Error(
      'Error while processing image, user not found'
    )
  const sizes = [
    {
      size: 90,
      relativeSize: 1
    },
    {
      size: 320,
      relativeSize: 2
    }
  ]

  for (const size of sizes) {
    const resizedImageData = await resizeImage(
      object,
      user,
      size.size,
      size.relativeSize
    )

    const userFiles = new UserFiles(user.id)
    await userFiles.insertNewFile(resizedImageData)
  }
}

const resizeImage = async (
  object: any,
  user: User | undefined,
  size: number,
  relativeSize: number
): Promise<IFileBase> => {
  const userDirectory = `${process.env.PHOTOS_DIRECTORY}${user?.username}/`
  const fileName = object.file_name
  const resizedFileName = `resized_${size}_${fileName}`
  const filePath = `${userDirectory}${fileName}`
  const resizedFilePath = `${userDirectory}${resizedFileName}`

  const resizedImage = await sharp(filePath)
    .resize({
      width: size,
      height: size,
      fit: sharp.fit.outside
    })
    .png()
    .toFile(resizedFilePath)

  return {
    fileName: resizedFileName,
    fileSize: resizedImage.size,
    fileType: object.mime_type,
    fileExtension: 'png',
    uuid: object.uuid,
    size: relativeSize
  }
}

const getUserByTelegramToken = async (
  telegramId: string
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
