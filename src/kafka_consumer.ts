import axios, { AxiosResponse } from 'axios'
import { createWriteStream, WriteStream } from 'fs'
import { Kafka } from 'kafkajs'
import env from 'dotenv'
import { loggers } from 'winston'
import logger from './infrastructure/logger'
import User from './models/user/user.model'
// import app from './router'
const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
})

const consumer = kafka.consumer({ groupId: 'test-group' })

const saveDownloadedFile = (
  object: any,
  response: AxiosResponse<any, any>
) => {
  return new Promise((resolve, reject) => {
    const fileName = object.file_name
    const userId = object.telegram_token
    const user = new User()
    user
      .findById(userId)
      .then((userData) => {
        if (userData) {
          const userDirectory = `${process.env.PHOTOS_DIRECTORY}${userData.username}/`

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
      .catch((err) => {
        logger.error(
          `Error finding user while processing kafka telegram job: ${err}`
        )
        reject(err)
      })
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
    eachMessage: async ({ topic, partition, message }) => {
      const token = process.env.TELEGRAM_TOKEN
      const object = message.value?.toString()
        ? JSON.parse(message.value.toString())
        : {}
      const filePath = object.file_path
      logger.verbose(`Downloading file from telegram`, {
        object
      })

      await axios
        .get(
          `${process.env.TELEGRAM_FILE_DOWNLOAD_URL}${token}/${filePath}`,
          {
            responseType: 'stream'
          }
        )
        .then((response) => {
          return saveDownloadedFile(object, response)
        })
        .catch((err) => {
          logger.error(
            `Error downloading telegram file: ${err}`,
            {
              url: `${process.env.TELEGRAM_FILE_DOWNLOAD_URL}${token}/${filePath}`
            }
          )
        })
    }
  })
}

export default kafkaConsumer
