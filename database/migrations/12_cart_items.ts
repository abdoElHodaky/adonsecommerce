import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cart_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('cart_id').unsigned().references('id').inTable('carts').onDelete('CASCADE')
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE')
      table.integer('product_variant_id').unsigned().references('id').inTable('product_variants').onDelete('CASCADE').nullable()
      table.integer('merchant_id').unsigned().references('id').inTable('merchants').onDelete('CASCADE')
      table.integer('quantity').notNullable()
      table.decimal('price', 10, 2).notNullable()
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

