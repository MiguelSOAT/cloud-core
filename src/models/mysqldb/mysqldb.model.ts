import MYSQLDBConnection from '../../infrastructure/mysqldb-connection'

export default class MYSQLDB<T> extends MYSQLDBConnection {
  constructor() {
    super()
  }

  private getConditionsString(
    conditions: string[]
  ): string {
    return conditions
      .map((condition) => `${condition} = ?`)
      .join(' AND ')
  }

  public async select(
    table: string,
    values: string[],
    conditions: string[],
    conditionsValues: (number | string)[]
  ): Promise<T[]> {
    const sql = `SELECT ${values.join(
      ', '
    )} FROM ${table} WHERE ${this.getConditionsString(
      conditions
    )}`
    const args = conditionsValues

    // super.connect()

    const rows: any[] = await super.query(sql, args)

    // super.close()

    return rows
  }

  public async delete(
    table: string,
    conditions: string[],
    conditionsValues: (number | string)[]
  ): Promise<void> {
    const sql = `DELETE FROM ${table} WHERE ${this.getConditionsString(
      conditions
    )}`
    const args = conditionsValues

    // super.connect()

    await super.query(sql, args)

    // super.close()
  }

  public async insert(
    table: string,
    keys: string[],
    values: (number | string)[]
  ): Promise<void> {
    const sql = `INSERT INTO ${table} (${keys.join(
      ', '
    )}) VALUES (${values.map(() => '?').join(', ')})`
    const args = values

    // // super.connect()

    await super.query(sql, args)

    // super.close()
  }

  public async update(
    table: string,
    keys: string[],
    values: (number | string)[],
    conditions: string[],
    conditionsValues: (number | string)[]
  ): Promise<void> {
    const sql = `UPDATE ${table} SET ${keys
      .map((key) => `${key} = ?`)
      .join(', ')} WHERE ${this.getConditionsString(
      conditions
    )}`
    const args = [...values, ...conditionsValues]

    // // super.connect()

    await super.query(sql, args)

    // // await super.close()
  }
}
