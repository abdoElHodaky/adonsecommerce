import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasOne,HasMany,BelongsTo } from '@adonisjs/lucid/types/relations'

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
  declare shippingAddress: string 

  @column()
  declare billingAddress: string 

  @column()
  declare paymentMethod: string 

  @column()
  declare paymentStatus: string 

  @column()
  declare notes: string 

  @column.dateTime()
  declare paidAt: DateTime 

  @column.dateTime()
  declare shippedAt: DateTime 

  @column.dateTime()
  declare deliveredAt: DateTime 

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

