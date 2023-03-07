import mysql from 'mysql'

export default class MYSQLDB {
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
        console.log(
          'ERROR while trying to connect to mysql',
          err
        )
      }
      console.log('Connected to database')
    })
  }

  public query(sql: string, args: any[]) {
    return new Promise((resolve, reject) => {
      // To prevent SQL injection, we use the mysql library's query method. with ? placeholders
      this.db.query(sql, args, (err, rows) => {
        if (err) {
          return reject(err)
        }
        resolve(rows)
      })
    })
  }

  public close() {
    this.db.end()
  }
}
