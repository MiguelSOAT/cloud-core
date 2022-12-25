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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const get_files_1 = __importDefault(require("./gdrive/get_files"));
const app = (0, express_1.default)();
const kafka_consumer_1 = __importDefault(require("./kafka_consumer"));
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = yield getImages();
    res.header('Access-Control-Allow-Origin', '*');
    res.json({
        images: payload
    });
}));
function getImages() {
    // const imagesARRAY = JSONtoSend(arrayOfFiles)
    const images = [];
    fs_1.default.readdirSync('./files/photos/').forEach((file) => {
        var _a;
        images.push({
            file_name: file,
            file_base64: toBase64(`./files/photos/${file}`),
            extension: ((_a = file.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || ''
        });
    });
    return images;
}
function toBase64(file) {
    const bitmap = fs_1.default.readFileSync(file);
    return new Buffer(bitmap).toString('base64');
}
// Router
app.listen(8080, () => {
    console.log('server started');
});
(0, get_files_1.default)().catch(console.error);
(0, kafka_consumer_1.default)().catch(console.error);
