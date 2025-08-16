import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasOne,HasMany,BelongsTo } from 'adonisjs/lucid/types/relations'

import User from './User.js'
import Merchant from './Merchant.js'
import OrderItem from './OrderItem.js'

export const OrderStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const

export type OrderStatusValues = typeof OrderStatus[keyof typeof OrderStatus]

export default class Order extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare merchantId: number

  @column()
  declare orderNumber: string

  @column()
  declare status: OrderStatusValues

  @column()
  declare subtotal: number

  @column()
  declare tax: number

  @column()
  declare shipping: number

  @column()
  declare discount: number

  @column()
  declare total: number

  @column()
  declare shippingAddress: string | null

  @column()
  declare billingAddress: string | null

  @column()
  declare paymentMethod: string | null

  @column()
  declare paymentStatus: string | null

  @column()
  declare notes: string | null

  @column.dateTime()
  declare paidAt: DateTime | null

  @column.dateTime()
  declare shippedAt: DateTime | null

  @column.dateTime()
  declare deliveredAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Merchant)
  declare merchant: BelongsTo<typeof Merchant>

  @hasMany(() => OrderItem)
  declare items: HasMany<typeof OrderItem>
}

