import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'carts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE').nullable()
      table.string('session_id').nullable()
      table.decimal('subtotal', 10, 2).defaultTo(0)
      table.decimal('tax', 10, 2).defaultTo(0)
      table.decimal('shipping', 10, 2).defaultTo(0)
      table.decimal('discount', 10, 2).defaultTo(0)
      table.decimal('total', 10, 2).defaultTo(0)
      table.string('coupon_code').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

