import MYSQLDBConnection from '../../infrastructure/mysqldb-connection'

export default class MYSQLDB<T> extends MYSQLDBConnection {
  constructor() {
    super()
  }

  private getConditionsString(
    conditions: string[],
    customConditions?: string[]
  ): string {
    let conditionString = conditions
      .map((condition) => `${condition} = ?`)
      .join(' AND ')
    if (customConditions) {
      conditionString += `${
        conditionString.length ? ' AND' : ''
      } ${customConditions.join(' AND ')}`
    }

    return conditionString
  }

  public async select(
    table: string,
    values: string[],
    conditions: string[],
    conditionsValues: (number | string)[],
    customConditions?: string[],
    groupBy?: string[],
    orderBy?: string,
    ascOrDesc?: string,
    limitOffset?: string
  ): Promise<T[]> {
    const sql = `SELECT ${values.join(
      ', '
    )} FROM ${table} WHERE ${this.getConditionsString(
      conditions,
      customConditions
    )}
    ${
      orderBy
        ? `ORDER BY ${orderBy} ${ascOrDesc || 'DESC'}`
        : ''
    }
    ${limitOffset ? `LIMIT ${limitOffset}` : ''}
    `
    const args = conditionsValues

    const rows: any[] = await super.query(sql, args)

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

    await super.query(sql, args)
  }

  public async insert(
    table: string,
    keys: string[],
    values: (number | string)[]
  ): Promise<any> {
    const sql = `INSERT INTO ${table} (${keys.join(
      ', '
    )}) VALUES (${values.map(() => '?').join(', ')})`
    const args = values

    const response = await super.query(sql, args)

    return response
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

    await super.query(sql, args)
  }
}
