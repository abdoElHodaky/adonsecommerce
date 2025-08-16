import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'order_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE')
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('SET NULL').nullable()
      table.integer('product_variant_id').unsigned().references('id').inTable('product_variants').onDelete('SET NULL').nullable()
      table.string('name').notNullable()
      table.string('sku').nullable()
      table.decimal('price', 10, 2).notNullable()
      table.integer('quantity').notNullable()
      table.decimal('subtotal', 10, 2).notNullable()
      table.json('options').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

