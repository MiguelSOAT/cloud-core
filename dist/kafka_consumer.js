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
const axios_1 = __importDefault(require("axios"));
const fs_1 = require("fs");
const kafkajs_1 = require("kafkajs");
// import app from './router'
const kafka = new kafkajs_1.Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092']
});
const consumer = kafka.consumer({ groupId: 'test-group' });
const kafkaConsumer = () => __awaiter(void 0, void 0, void 0, function* () {
    // Consuming
    yield consumer.connect();
    yield consumer.subscribe({
        topic: 'telegram',
        fromBeginning: true
    });
    yield consumer.run({
        eachMessage: ({ topic, partition, message }) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            console.log((_a = message.value) === null || _a === void 0 ? void 0 : _a.toString());
            const object = ((_b = message.value) === null || _b === void 0 ? void 0 : _b.toString())
                ? JSON.parse(message.value.toString())
                : {};
            const filePath = object.file_path;
            const fileName = object.file_name;
            const writer = (0, fs_1.createWriteStream)(`./files/photos/${fileName}`);
            const token = '5987879116:AAEM_G_ZS5ogZLSALWTf_JezHxkta_9ujvI';
            const file = yield axios_1.default
                .get(`https://api.telegram.org/file/bot${token}/${filePath}`, {
                responseType: 'stream'
            })
                .then((response) => {
                return new Promise((resolve, reject) => {
                    response.data.pipe(writer);
                    let error = null;
                    writer.on('error', (err) => {
                        error = err;
                        writer.close();
                        reject(err);
                    });
                    writer.on('close', () => {
                        if (!error) {
                            resolve(true);
                        }
                    });
                });
            });
        })
    });
});
exports.default = kafkaConsumer;
