import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany, manyToMany, ManyToMany } from '@adonisjs/lucid/orm'
import type { Merchant } from '#models/merchant'
import type { Category } from '#models/category'
import type { ProductImage } from '#models/product_image'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare merchantId: number

  @column()
  declare name: string

  @column()
  declare slug: string

  @column()
  declare description: string | null

  @column()
  declare shortDescription: string | null

  @column()
  declare price: number

  @column()
  declare comparePrice: number | null

  @column()
  declare stockQuantity: number

  @column()
  declare sku: string | null

  @column()
  declare isFeatured: boolean

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => import('#models/merchant'))
  declare merchant: BelongsTo<typeof import('#models/merchant')>

  @manyToMany(() => import('#models/category'), {
    pivotTable: 'product_categories',
  })
  declare categories: ManyToMany<typeof import('#models/category')>

  @hasMany(() => import('#models/product_image'))
  declare images: HasMany<typeof import('#models/product_image')>
}

