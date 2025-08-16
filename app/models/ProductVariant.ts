import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { HasOne,HasMany,BelongsTo } from 'adonisjs/lucid/types/relations'

import Product from './Product.js'

export default class ProductVariant extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare productId: number

  @column()
  declare name: string

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
  declare options: any | null

  @column()
  declare image: string | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>
}

