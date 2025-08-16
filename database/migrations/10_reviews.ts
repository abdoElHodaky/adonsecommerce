import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'reviews'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.enum('type', ['product', 'merchant']).notNullable()
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE').nullable()
      table.integer('merchant_id').unsigned().references('id').inTable('merchants').onDelete('CASCADE').nullable()
      table.integer('rating').notNullable()
      table.string('title').notNullable()
      table.text('comment').notNullable()
      table.boolean('is_approved').defaultTo(true)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

