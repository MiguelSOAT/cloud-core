"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Search file in drive location
 * @return{obj} data file
 * */
const google_auth_library_1 = require("google-auth-library");
const googleapis_1 = require("googleapis");
function searchFile() {
    return __awaiter(this, void 0, void 0, function* () {
        // Get credentials and build service
        // TODO (developer) - Use appropriate auth mechanism for your app
        console.log('Authenticating...');
        const auth = new google_auth_library_1.GoogleAuth({
            scopes: 'https://www.googleapis.com/auth/drive',
            keyFile: './src/gdrive/credentials.json'
        });
        const service = googleapis_1.google.drive({ version: 'v3', auth });
        console.log('authenticated');
        const files = [];
        try {
            const res = yield service.files.list({
                q: "mimeType='image/jpeg'",
                fields: 'nextPageToken, files(id, name)',
                spaces: 'drive'
            });
            // Array.prototype.push.apply(files, res.files)
            // res.data.files.forEach(function (file) {
            //   console.log('Found file:', file.name, file.id)
            // })
            return res.data.files;
        }
        catch (err) {
            console.log('errrooooor');
            console.log(JSON.stringify(err));
            throw err;
        }
    });
}
exports.default = searchFile;
