import { Server } from 'socket.io'
import http from 'http'
import CustomLogger from './infrastructure/custom-logger'
import kafkaConsumer from './kafka_consumer'
import app from './index'
import fs from 'fs'

const server = http.createServer(app)
const io = new Server(server, {
  path: '/socket.io'
})

fs.mkdirSync(process.env.FILES_DIRECTORY || './storage', {
  recursive: true
})

fs.mkdirSync(process.env.UPLOAD_DIRECTORY || './uploads', {
  recursive: true
})

io.on('connection', (socket) => {
  CustomLogger.info('A user connected')

  socket.on('mensaje', (data) => {
    CustomLogger.info('message: ' + data)
  })

  socket.on('disconnect', () => {
    CustomLogger.info('Un cliente se ha desconectado.')
  })
})

if (process.env.NODE_ENV !== 'test') {
  kafkaConsumer(io).catch((error) => {
    CustomLogger.error('Kafka consumer error', {
      error
    })
  })
  server.listen(8080, () => {
    console.log('Server started on port 8080')
  })
}

export { server, io }
