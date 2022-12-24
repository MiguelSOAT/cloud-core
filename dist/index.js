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
const app = (0, express_1.default)();
const kafka_consumer_1 = __importDefault(require("./kafka_consumer"));
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = yield getImages();
    res.header('Access-Control-Allow-Origin', '*');
    res.json({
        images: payload
    });
}));
const arrayOfFiles = [
    // '/home/miguel-dell/personal/cloud-core/files/eef72607-676d-423b-979d-a731eaaec547_90x90.jpg',
    '/home/miguel-dell/personal/cloud-core/files/eef72607-676d-423b-979d-a731eaaec547_320x320.jpg',
    // '/home/miguel-dell/personal/cloud-core/files/eef72607-676d-423b-979d-a731eaaec547_1664x1664.jpg',
    // '/home/miguel-dell/personal/cloud-core/files/f46e0722-724a-4e4e-8c11-93c02b160fcc_90x90.jpg',
    '/home/miguel-dell/personal/cloud-core/files/f46e0722-724a-4e4e-8c11-93c02b160fcc_320x320.jpg',
    // '/home/miguel-dell/personal/cloud-core/files/f46e0722-724a-4e4e-8c11-93c02b160fcc_1024x1024.jpg'
    '/home/miguel-dell/personal/cloud-core/files/IMG_20220914_082340_945.jpg',
    '/home/miguel-dell/personal/cloud-core/files/IMG_20220918_120859_810.jpg',
    '/home/miguel-dell/personal/cloud-core/files/Juanik0_la_virgen_y_los_amgeles_cielo_estelar_cielo_de_neonfant_e7e69261-3205-4550-93d4-2fd9b910780b.png',
    '/home/miguel-dell/personal/cloud-core/files/Juanik0_Bruja_volando_en_un_escoba_en_un_CIELO_TENEBROSO_Y_CAST_93394b37-15cc-4d0c-b223-ce6a002cacc4.png',
    '/home/miguel-dell/personal/cloud-core/files/milicevicmar_A_single_young_woman_standing_on_the_edge_of_a_cli_3ab42ae7-54c5-4fdf-a0ce-41140c56c578.png',
    '/home/miguel-dell/personal/cloud-core/files/milicevicmar_a_woman_from_fairy_tale_with_butterflies_around_he_963a2286-1076-4c5e-bf08-8719c4f0f41a.png',
    '/home/miguel-dell/personal/cloud-core/files/milicevicmar_portrait_of_a_mid-age_woman_hyper_realistic_and_de_f4fd92ac-7544-488e-a197-07fa58361c36.png',
    '/home/miguel-dell/personal/cloud-core/files/Shroomicorn_reflection_in_reflection_in_reflection_detailed_cre_b93bd97d-a3df-46f0-875e-a3ebe56ba2d8.png'
];
function JSONtoSend(arrayOfFiles) {
    const arrayOfBase64 = arrayOfFiles.map((file) => {
        return toBase64(file);
    });
    const arrayOfJSON = arrayOfBase64.map((base64, index) => {
        return {
            file_name: arrayOfFiles[index].split('/')[arrayOfFiles[index].split('/').length - 1],
            file_base64: base64
        };
    });
    return arrayOfJSON;
}
function sendRandomImage(arrayOfJSON) {
    const random = Math.floor(Math.random() * arrayOfJSON.length);
    return arrayOfJSON[random];
}
function getImages() {
    const imagesARRAY = JSONtoSend(arrayOfFiles);
    const images = [];
    for (let i = 0; i < 10; i++) {
        const randomImage = sendRandomImage(imagesARRAY);
        images.push(randomImage);
    }
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
(0, kafka_consumer_1.default)().catch(console.error);
