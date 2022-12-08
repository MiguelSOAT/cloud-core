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
const kafkajs_1 = require("kafkajs");
const kafka = new kafkajs_1.Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092']
});
const consumer = kafka.consumer({ groupId: 'test-group' });
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    // Consuming
    yield consumer.connect();
    yield consumer.subscribe({
        topic: 'telegram',
        fromBeginning: true
    });
    yield consumer.run({
        eachMessage: ({ topic, partition, message }) => __awaiter(void 0, void 0, void 0, function* () {
            // console.log({
            //   partition,
            //   offset: message.offset,
            //   value: message ? message.value?.toString() : ''
            // })
            // const object = message.value?.toString()
            //   ? JSON.parse(message.value.toString())
            //   : {}
            // const filePath = object.file_path
            // const fileName = object.file_name
            // const writer = createWriteStream(
            //   `./files/${fileName}`
            // )
            // const token =
            //   '5987879116:AAEM_G_ZS5ogZLSALWTf_JezHxkta_9ujvI'
            // console.log(filePath)
            // const file = await axios
            //   .get(
            //     `https://api.telegram.org/file/bot${token}/${filePath}`,
            //     {
            //       responseType: 'stream'
            //     }
            //   )
            //   .then((response) => {
            //     return new Promise((resolve, reject) => {
            //       response.data.pipe(writer)
            //       let error: null | any = null
            //       writer.on('error', (err) => {
            //         error = err
            //         writer.close()
            //         reject(err)
            //       })
            //       writer.on('close', () => {
            //         if (!error) {
            //           resolve(true)
            //         }
            //       })
            //     })
            //   })
        })
    });
});
run().catch(console.error);
