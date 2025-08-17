import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'product_categories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE')
      table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('CASCADE')
      table.timestamp('created_at').notNullable()
      
      // Composite unique key
      table.unique(['product_id', 'category_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

