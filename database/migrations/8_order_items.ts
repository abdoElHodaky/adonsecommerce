import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'order_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE')
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('SET NULL').nullable()
      table.integer('merchant_id').unsigned().references('id').inTable('merchants').onDelete('SET NULL').nullable()
      table.string('product_name').notNullable()
      table.decimal('price', 10, 2).notNullable()
      table.integer('quantity').notNullable()
      table.decimal('subtotal', 10, 2).notNullable()
      table.enum('status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled']).defaultTo('pending')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

