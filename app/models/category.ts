import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany, manyToMany, ManyToMany } from '@adonisjs/lucid/orm'
import type { Product } from '#models/product'

export default class Category extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare slug: string

  @column()
  declare description: string | null

  @column()
  declare imageUrl: string | null

  @column()
  declare parentId: number | null

  @column()
  declare isActive: boolean

  @column()
  declare sortOrder: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Category, {
    foreignKey: 'parentId',
  })
  declare parent: BelongsTo<typeof Category>

  @hasMany(() => Category, {
    foreignKey: 'parentId',
  })
  declare children: HasMany<typeof Category>

  @manyToMany(() => import('#models/product'), {
    pivotTable: 'product_categories',
  })
  declare products: ManyToMany<typeof import('#models/product')>
}

