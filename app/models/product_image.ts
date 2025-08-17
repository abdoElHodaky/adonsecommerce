import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@adonisjs/lucid/orm'
import type { Product } from '#models/product'

export default class ProductImage extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare productId: number

  @column()
  declare imageUrl: string

  @column()
  declare isPrimary: boolean

  @column()
  declare sortOrder: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => import('#models/product'))
  declare product: BelongsTo<typeof import('#models/product')>
}

