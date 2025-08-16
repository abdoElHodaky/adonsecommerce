import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, BelongsTo } from '@adonisjs/lucid/orm'
import Order from './Order.js'
import Product from './Product.js'
import ProductVariant from './ProductVariant.js'

export default class OrderItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orderId: number

  @column()
  declare productId: number

  @column()
  declare productVariantId: number | null

  @column()
  declare name: string

  @column()
  declare sku: string | null

  @column()
  declare price: number

  @column()
  declare quantity: number

  @column()
  declare subtotal: number

  @column()
  declare options: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => ProductVariant)
  declare productVariant: BelongsTo<typeof ProductVariant>
}

