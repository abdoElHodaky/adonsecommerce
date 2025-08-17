import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('merchant_id').unsigned().references('id').inTable('merchants').onDelete('CASCADE')
      table.string('name').notNullable()
      table.string('slug').notNullable().unique()
      table.text('description').nullable()
      table.text('short_description').nullable()
      table.decimal('price', 10, 2).notNullable()
      table.decimal('compare_price', 10, 2).nullable()
      table.integer('stock_quantity').defaultTo(0)
      table.string('sku').nullable()
      table.boolean('is_featured').defaultTo(false)
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

