import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasOne,HasMany,BelongsTo } from 'adonisjs/lucid/types/relations'

import User from './User.js'
import Product from './Product.js'
import Order from './Order.js'
import Review from './Review.js'

export const MerchantStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
} as const

export type MerchantStatusValues = typeof MerchantStatus[keyof typeof MerchantStatus]

export default class Merchant extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare storeName: string

  @column()
  declare slug: string

  @column()
  declare description: string | null

  @column()
  declare logo: string | null

  @column()
  declare bannerImage: string | null

  @column()
  declare address: string | null

  @column()
  declare city: string | null

  @column()
  declare state: string | null

  @column()
  declare country: string | null

  @column()
  declare postalCode: string | null

  @column()
  declare contactEmail: string

  @column()
  declare contactPhone: string | null

  @column()
  declare website: string | null

  @column()
  declare status: MerchantStatusValues

  @column()
  declare commissionRate: number

  @column()
  declare isVerified: boolean

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => Product)
  declare products: HasMany<typeof Product>

  @hasMany(() => Order)
  declare orders: HasMany<typeof Order>

  @hasMany(() => Review, {
    foreignKey: 'merchantId',
    onQuery: (query) => query.where('type', 'merchant'),
  })
  declare reviews: HasMany<typeof Review>
}

