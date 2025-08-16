import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasOne,HasMany,BelongsTo,ManyToMany } from '@adonisjs/lucid/types/relations'

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
  declare description: string 

  @column()
  declare shortDescription: string 

  @column()
  declare sku: string 

  @column()
  declare price: number

  @column()
  declare compareAtPrice: number 

  @column()
  declare costPrice: number 

  @column()
  declare quantity: number

  @column()
  declare isManageStock: boolean

  @column()
  declare lowStockThreshold: number 

  @column()
  declare weight: number 

  @column()
  declare weightUnit: string 

  @column()
  declare dimensions: string 

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

