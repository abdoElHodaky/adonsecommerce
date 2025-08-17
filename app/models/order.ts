import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany } from '@adonisjs/lucid/orm'
import type { User } from '#models/user'
import type { OrderItem } from '#models/order_item'

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export default class Order extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number | null

  @column()
  declare orderNumber: string

  @column()
  declare status: OrderStatus

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
  declare paymentMethod: string | null

  @column()
  declare paymentStatus: string

  @column()
  declare shippingMethod: string | null

  @column()
  declare shippingName: string | null

  @column()
  declare shippingAddress: string | null

  @column()
  declare shippingCity: string | null

  @column()
  declare shippingState: string | null

  @column()
  declare shippingPostalCode: string | null

  @column()
  declare shippingCountry: string | null

  @column()
  declare shippingPhone: string | null

  @column()
  declare billingName: string | null

  @column()
  declare billingAddress: string | null

  @column()
  declare billingCity: string | null

  @column()
  declare billingState: string | null

  @column()
  declare billingPostalCode: string | null

  @column()
  declare billingCountry: string | null

  @column()
  declare billingPhone: string | null

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => import('#models/user'))
  declare user: BelongsTo<typeof import('#models/user')>

  @hasMany(() => import('#models/order_item'))
  declare items: HasMany<typeof import('#models/order_item')>
}

