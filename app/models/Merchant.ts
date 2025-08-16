import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasOne,HasMany,BelongsTo } from '@adonisjs/lucid/types/relations'

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
  declare description: string 

  @column()
  declare logo: string 

  @column()
  declare bannerImage: string 

  @column()
  declare address: string 

  @column()
  declare city: string 

  @column()
  declare state: string 

  @column()
  declare country: string 

  @column()
  declare postalCode: string 

  @column()
  declare contactEmail: string

  @column()
  declare contactPhone: string 

  @column()
  declare website: string 

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

