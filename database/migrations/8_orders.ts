import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL').nullable()
      table.integer('merchant_id').unsigned().references('id').inTable('merchants').onDelete('SET NULL').nullable()
      table.string('order_number').notNullable().unique()
      table.enum('status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).defaultTo('pending')
      table.decimal('subtotal', 10, 2).notNullable()
      table.decimal('tax', 10, 2).defaultTo(0)
      table.decimal('shipping', 10, 2).defaultTo(0)
      table.decimal('discount', 10, 2).defaultTo(0)
      table.decimal('total', 10, 2).notNullable()
      table.text('shipping_address').nullable()
      table.text('billing_address').nullable()
      table.string('payment_method').nullable()
      table.string('payment_status').nullable()
      table.text('notes').nullable()
      table.timestamp('paid_at').nullable()
      table.timestamp('shipped_at').nullable()
      table.timestamp('delivered_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

