import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'product_variants'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE')
      table.string('name').notNullable()
      table.string('sku').nullable()
      table.decimal('price', 10, 2).notNullable()
      table.decimal('compare_at_price', 10, 2).nullable()
      table.decimal('cost_price', 10, 2).nullable()
      table.integer('quantity').defaultTo(0)
      table.json('options').nullable()
      table.string('image').nullable()
      table.boolean('is_active').defaultTo(true)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

