import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'category_product'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('CASCADE')
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      // Add unique constraint to prevent duplicate entries
      table.unique(['category_id', 'product_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

