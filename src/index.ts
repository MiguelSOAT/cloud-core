import express from 'express'
import getImagesRouter from './routes/get-images.router'
import signupRouter from './routes/post-signup.router'
import loginRouter from './routes/post-login.route'
import mysql from 'mysql'
// import searchFile from './gdrive/get_files'
const app = express()
import kafkaConsumer from './kafka_consumer'
import env from 'dotenv'

env.config()

// Router
app.use(express.json())
app.use('/v1', getImagesRouter)
app.use('/v1', signupRouter)
app.use('/v1', loginRouter)
app.listen(8080, () => {
  console.log('Server started on port 8080')
})

// searchFile().catch(console.error)

kafkaConsumer().catch(console.error)
