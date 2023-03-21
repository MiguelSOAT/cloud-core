import mysql from 'mysql'
import logger from './logger'

export default class MYSQLDBConnectionConnection {
  db: mysql.Connection

  constructor() {
    this.db = mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4'
    })
  }

  public connect() {
    this.db.connect((err) => {
      if (err) {
        logger.error('Error connecting to mysql database')
      }
    })
  }

  public query(sql: string, args: any[]): any {
    return new Promise((resolve, reject) => {
      // To prevent SQL injection, we use the mysql library's query method. with ? placeholders
      this.db.query(sql, args, (err, rows: any[]) => {
        if (err) {
          logger.error(
            'Error while querying mysql database'
          )
          return reject(err)
        }
        resolve(rows)
      })
    })
  }

  public async close() {
    this.db.end(async () => {
      logger.info('Mysql connection closed')
      return true
    })
  }
}
