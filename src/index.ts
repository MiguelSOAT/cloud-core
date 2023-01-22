import express from 'express'
import getImagesRouter from './routes/get-images.router'
// import searchFile from './gdrive/get_files'
const app = express()
import kafkaConsumer from './kafka_consumer'

// Router
app.use('/v1', getImagesRouter)
app.listen(8080, () => {
  console.log('server started')
})

// searchFile().catch(console.error)

kafkaConsumer().catch(console.error)
