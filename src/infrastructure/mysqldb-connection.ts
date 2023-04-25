import mysql from 'mysql'
import CustomLogger from './custom-logger'
import env from 'dotenv'

env.config()

const dbPool: mysql.Pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
  connectionLimit: 10
})

export default class MYSQLDBConnectionConnection {
  db: mysql.Pool

  constructor() {
    this.db = dbPool
  }

  public query(sql: string, args: any[]): any {
    return new Promise((resolve, reject) => {
      // To prevent SQL injection, we use the mysql library's query method. with ? placeholders
      this.db.query(sql, args, (err, rows: any[]) => {
        if (err) {
          CustomLogger.error(
            'Error while querying mysql database',
            {
              host: process.env.DB_HOST,
              port: Number(process.env.DB_PORT),
              user: process.env.DB_USER,
              password: process.env.DB_PASSWORD,
              database: process.env.DB_NAME,
              charset: 'utf8mb4',
              connectionLimit: 10
            }
          )
          return reject(err)
        }
        resolve(rows)
      })
    })
  }
}
