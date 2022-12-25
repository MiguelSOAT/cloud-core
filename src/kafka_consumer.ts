import axios from 'axios'
import { createWriteStream } from 'fs'
import { Kafka } from 'kafkajs'
// import app from './router'
const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
})

const consumer = kafka.consumer({ groupId: 'test-group' })

const kafkaConsumer = async () => {
  // Consuming
  await consumer.connect()
  await consumer.subscribe({
    topic: 'telegram',
    fromBeginning: true
  })

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(message.value?.toString())
      const object = message.value?.toString()
        ? JSON.parse(message.value.toString())
        : {}
      const filePath = object.file_path
      const fileName = object.file_name
      const writer = createWriteStream(
        `./files/photos/${fileName}`
      )
      const token =
        '5987879116:AAEM_G_ZS5ogZLSALWTf_JezHxkta_9ujvI'

      const file = await axios
        .get(
          `https://api.telegram.org/file/bot${token}/${filePath}`,
          {
            responseType: 'stream'
          }
        )
        .then((response) => {
          return new Promise((resolve, reject) => {
            response.data.pipe(writer)
            let error: null | any = null
            writer.on('error', (err) => {
              error = err
              writer.close()
              reject(err)
            })
            writer.on('close', () => {
              if (!error) {
                resolve(true)
              }
            })
          })
        })
    }
  })
}

export default kafkaConsumer
