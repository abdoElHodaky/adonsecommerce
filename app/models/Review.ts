import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { HasOne,HasMany,BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './User.js'
import Product from './Product.js'
import Merchant from './Merchant.js'

export const ReviewType = {
  PRODUCT: 'product',
  MERCHANT: 'merchant',
} as const

export type ReviewTypeValues = typeof ReviewType[keyof typeof ReviewType]

export default class Review extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare productId: number | null

  @column()
  declare merchantId: number | null

  @column()
  declare type: ReviewTypeValues

  @column()
  declare rating: number

  @column()
  declare title: string | null

  @column()
  declare comment: string | null

  @column()
  declare isVerified: boolean

  @column()
  declare isApproved: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => Merchant)
  declare merchant: BelongsTo<typeof Merchant>
}

