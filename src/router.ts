// import express from 'express'
// import fs from 'fs'
// const app = express()
// const router = express.Router()

// app.listen(8080, () => {
//   console.log('server started in port 8080')
// })

// router.get('/', async (req, res) => {
//   const payload = await getImages()
//   res.send('Hello World')
// })

// const arrayOfFiles = [
//   '/home/miguel-dell/personal/cloud-core/files/eef72607-676d-423b-979d-a731eaaec547_90x90.jpg',
//   '/home/miguel-dell/personal/cloud-core/files/eef72607-676d-423b-979d-a731eaaec547_320x320.jpg',
//   '/home/miguel-dell/personal/cloud-core/files/eef72607-676d-423b-979d-a731eaaec547_1664x1664.jpg',
//   '/home/miguel-dell/personal/cloud-core/files/f46e0722-724a-4e4e-8c11-93c02b160fcc_90x90.jpg',
//   '/home/miguel-dell/personal/cloud-core/files/f46e0722-724a-4e4e-8c11-93c02b160fcc_320x320.jpg',
//   '/home/miguel-dell/personal/cloud-core/files/f46e0722-724a-4e4e-8c11-93c02b160fcc_1024x1024.jpg'
// ]

// interface image {
//   file_name: string
//   file_base64: string
// }

// function JSONtoSend(arrayOfFiles: string[]) {
//   const arrayOfBase64 = arrayOfFiles.map((file) => {
//     return toBase64(file)
//   })
//   const arrayOfJSON = arrayOfBase64.map((base64, index) => {
//     return {
//       file_name:
//         arrayOfFiles[index].split('/')[
//           arrayOfFiles[index].split('/').length - 1
//         ],
//       file_base64: base64
//     }
//   })
//   return arrayOfJSON
// }

// function sendRandomImage(arrayOfJSON: image[]): image {
//   const random = Math.floor(
//     Math.random() * arrayOfJSON.length
//   )
//   return arrayOfJSON[random]
// }

// function getImages(): image[] {
//   const imagesARRAY = JSONtoSend(arrayOfFiles)
//   const images: image[] = []
//   for (let i = 0; i < 10; i++) {
//     const randomImage = sendRandomImage(imagesARRAY)
//     images.push(randomImage)
//   }

//   return images
// }

// function toBase64(file: string) {
//   const bitmap = fs.readFileSync(file)
//   return new Buffer(bitmap).toString('base64')
// }

// export default app
