import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, manyToMany, BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/orm'
import Merchant from './Merchant.js'
import Category from './Category.js'
import ProductVariant from './ProductVariant.js'
import ProductImage from './ProductImage.js'
import Review from './Review.js'

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
  declare sku: string | null

  @column()
  declare price: number

  @column()
  declare compareAtPrice: number | null

  @column()
  declare costPrice: number | null

  @column()
  declare quantity: number

  @column()
  declare isManageStock: boolean

  @column()
  declare lowStockThreshold: number | null

  @column()
  declare weight: number | null

  @column()
  declare weightUnit: string | null

  @column()
  declare dimensions: string | null

  @column()
  declare hasVariants: boolean

  @column()
  declare isFeatured: boolean

  @column()
  declare isPublished: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Merchant)
  declare merchant: BelongsTo<typeof Merchant>

  @manyToMany(() => Category, {
    pivotTable: 'category_product',
  })
  declare categories: ManyToMany<typeof Category>

  @hasMany(() => ProductVariant)
  declare variants: HasMany<typeof ProductVariant>

  @hasMany(() => ProductImage)
  declare images: HasMany<typeof ProductImage>

  @hasMany(() => Review, {
    foreignKey: 'productId',
    onQuery: (query) => query.where('type', 'product'),
  })
  declare reviews: HasMany<typeof Review>
}

