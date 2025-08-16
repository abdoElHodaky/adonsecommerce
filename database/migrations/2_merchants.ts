import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'merchants'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('store_name').notNullable()
      table.string('slug').notNullable().unique()
      table.text('description').nullable()
      table.string('logo').nullable()
      table.string('banner_image').nullable()
      table.string('address').nullable()
      table.string('city').nullable()
      table.string('state').nullable()
      table.string('country').nullable()
      table.string('postal_code').nullable()
      table.string('contact_email').notNullable()
      table.string('contact_phone').nullable()
      table.string('website').nullable()
      table.enum('status', ['pending', 'approved', 'rejected', 'suspended']).defaultTo('pending')
      table.decimal('commission_rate', 5, 2).defaultTo(0)
      table.boolean('is_verified').defaultTo(false)
      table.boolean('is_active').defaultTo(true)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

