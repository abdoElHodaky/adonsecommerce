import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL').nullable()
      table.string('order_number').notNullable().unique()
      table.enum('status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled']).defaultTo('pending')
      table.decimal('subtotal', 10, 2).notNullable()
      table.decimal('tax', 10, 2).defaultTo(0)
      table.decimal('shipping', 10, 2).defaultTo(0)
      table.decimal('discount', 10, 2).defaultTo(0)
      table.decimal('total', 10, 2).notNullable()
      table.string('payment_method').nullable()
      table.string('payment_status').defaultTo('pending')
      table.string('shipping_method').nullable()
      
      // Shipping address
      table.string('shipping_name').nullable()
      table.string('shipping_address').nullable()
      table.string('shipping_city').nullable()
      table.string('shipping_state').nullable()
      table.string('shipping_postal_code').nullable()
      table.string('shipping_country').nullable()
      table.string('shipping_phone').nullable()
      
      // Billing address
      table.string('billing_name').nullable()
      table.string('billing_address').nullable()
      table.string('billing_city').nullable()
      table.string('billing_state').nullable()
      table.string('billing_postal_code').nullable()
      table.string('billing_country').nullable()
      table.string('billing_phone').nullable()
      
      table.text('notes').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

