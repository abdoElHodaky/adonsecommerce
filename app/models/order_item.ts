import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@adonisjs/lucid/orm'
import type { Order } from '#models/order'
import type { Product } from '#models/product'
import type { Merchant } from '#models/merchant'

export type OrderItemStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export default class OrderItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orderId: number

  @column()
  declare productId: number | null

  @column()
  declare merchantId: number | null

  @column()
  declare productName: string

  @column()
  declare price: number

  @column()
  declare quantity: number

  @column()
  declare subtotal: number

  @column()
  declare status: OrderItemStatus

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => import('#models/order'))
  declare order: BelongsTo<typeof import('#models/order')>

  @belongsTo(() => import('#models/product'))
  declare product: BelongsTo<typeof import('#models/product')>

  @belongsTo(() => import('#models/merchant'))
  declare merchant: BelongsTo<typeof import('#models/merchant')>
}

