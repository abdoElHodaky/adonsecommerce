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
      table.string('logo_url').nullable()
      table.string('banner_url').nullable()
      table.string('contact_email').nullable()
      table.string('contact_phone').nullable()
      table.string('address').nullable()
      table.string('city').nullable()
      table.string('state').nullable()
      table.string('postal_code').nullable()
      table.string('country').nullable()
      table.boolean('is_verified').defaultTo(false)
      table.boolean('is_featured').defaultTo(false)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

