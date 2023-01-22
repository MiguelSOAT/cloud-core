import GetImagesService from '../services/get-images/get-images.service'

export default class GetImagesAction {
  public static async invoke() {
    const images: Iimage[] =
      await GetImagesService.execute()
    return images
  }
}
