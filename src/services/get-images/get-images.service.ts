import fs from 'fs'
import GetImagesDomain from '../../domains/get-images/get-images.domain'

export default class GetImagesService {
  public static async execute(): Promise<Iimage[]> {
    const images: Iimage[] = []
    const path = './files/photos/' // TODO: Export to ENV var?
    fs.readdirSync(path).forEach((fileName) => {
      const filePath = `${path}${fileName}`
      const fileData: string = this.toBase64(filePath)
      const image: Iimage = new GetImagesDomain(
        fileName,
        fileData
      )
      images.push(image)
    })

    return images
  }

  public static toBase64(filePath: string): string {
    const bitmap = fs.readFileSync(filePath)
    return Buffer.from(bitmap).toString('base64')
  }
}
