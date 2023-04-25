import winston from 'winston'

export default class CustomLogger {
  static CustomLogger = winston.createLogger({
    format: winston.format.json(),
    defaultMeta: { service: 'kafka-telegram-producer' },
    transports: [
      new winston.transports.File({
        filename: './logs/error.log',
        level: 'error'
      }),
      new winston.transports.File({
        filename: './logs/combined.log'
      })
    ]
  })

  static info(message: string) {
    this.CustomLogger.info(this.getData(message))
  }

  static verbose(message: string, objects?: any) {
    this.CustomLogger.info(this.getData(message, objects))
  }

  static error(message: string, objects?: any) {
    this.CustomLogger.error(this.getData(message, objects))
  }

  static getData(message: string, objects?: any) {
    const data: Record<string, any> = {
      time: this.timeStamp(),
      message
    }

    if (objects) Object.assign(data, objects)

    return data
  }

  static timeStamp() {
    return new Date().toISOString()
  }
}
