import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'reviews'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE').nullable()
      table.integer('merchant_id').unsigned().references('id').inTable('merchants').onDelete('CASCADE').nullable()
      table.enum('type', ['product', 'merchant']).notNullable()
      table.integer('rating').notNullable()
      table.string('title').nullable()
      table.text('comment').nullable()
      table.boolean('is_verified').defaultTo(false)
      table.boolean('is_approved').defaultTo(false)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

