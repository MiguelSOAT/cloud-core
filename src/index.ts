import express from 'express'
import fs from 'fs'
// import searchFile from './gdrive/get_files'
const app = express()
import kafkaConsumer from './kafka_consumer'

app.get('/', async (req, res) => {
  const payload = await getImages()

  res.header('Access-Control-Allow-Origin', '*')
  res.json({
    images: payload
  })
})


interface image {
  file_name: string
  file_base64: string
  extension: string
}

function getImages(): image[] {
  // const imagesARRAY = JSONtoSend(arrayOfFiles)
  const images: image[] = []

  fs.readdirSync('./files/photos/').forEach((file) => {
    images.push({
      file_name: file,
      file_base64: toBase64(`./files/photos/${file}`),
      extension: file.split('.').pop()?.toUpperCase() || ''
    })
  })

  return images
}

function toBase64(file: string) {
  const bitmap = fs.readFileSync(file)
  return new Buffer(bitmap).toString('base64')
}
// Router

app.listen(8080, () => {
  console.log('server started')
})

// searchFile().catch(console.error)

kafkaConsumer().catch(console.error)
