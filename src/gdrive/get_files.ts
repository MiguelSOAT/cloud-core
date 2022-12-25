/**
 * Search file in drive location
 * @return{obj} data file
 * */
import { GoogleAuth } from 'google-auth-library'
import { google } from 'googleapis'

async function searchFile() {
  // Get credentials and build service
  // TODO (developer) - Use appropriate auth mechanism for your app
  console.log('Authenticating...')
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/drive',
    key: 'AIzaSyCVySNBz43kwFG4HP1Gd23kdJDqoFkGu9c'
  })
  const service = google.drive({ version: 'v3', auth })
  console.log('authenticated')
  const files = []
  try {
    const res = await service.files.list()
    // Array.prototype.push.apply(files, res.files)
    // res.data.files.forEach(function (file) {
    //   console.log('Found file:', file.name, file.id)
    // })
    return res.data.files
  } catch (err) {
    console.log('errrooooor')
    console.log(JSON.stringify(err))
    throw err
  }
}

export default searchFile
