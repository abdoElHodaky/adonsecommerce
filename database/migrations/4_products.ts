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
      table.string('sku').nullable()
      table.decimal('price', 10, 2).notNullable()
      table.decimal('compare_at_price', 10, 2).nullable()
      table.decimal('cost_price', 10, 2).nullable()
      table.integer('quantity').defaultTo(0)
      table.boolean('is_manage_stock').defaultTo(true)
      table.integer('low_stock_threshold').nullable()
      table.decimal('weight', 10, 2).nullable()
      table.string('weight_unit').nullable()
      table.string('dimensions').nullable()
      table.boolean('has_variants').defaultTo(false)
      table.boolean('is_featured').defaultTo(false)
      table.boolean('is_published').defaultTo(false)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

