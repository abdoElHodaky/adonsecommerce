import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasOne,HasMany,BelongsTo , ManyToMany } from '@adonisjs/lucid/types/relations'
import Product from './Product.js'

export default class Category extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare slug: string

  @column()
  declare description: string

  @column()
  declare image: string 

  @column()
  declare parentId: number 

  @column()
  declare sortOrder: number

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Category, {
    foreignKey: 'parentId',
  })
  declare parent: BelongsTo<typeof Category>

  @hasMany(() => Category, {
    foreignKey: 'parentId',
  })
  declare children: HasMany<typeof Category>

  @manyToMany(() => Product, {
    pivotTable: 'category_product',
  })
  declare products: ManyToMany<typeof Product>
}

