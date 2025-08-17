import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany } from '@adonisjs/lucid/orm'
import type { User } from '#models/user'
import type { Product } from '#models/product'

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
  declare logoUrl: string | null

  @column()
  declare bannerUrl: string | null

  @column()
  declare contactEmail: string | null

  @column()
  declare contactPhone: string | null

  @column()
  declare address: string | null

  @column()
  declare city: string | null

  @column()
  declare state: string | null

  @column()
  declare postalCode: string | null

  @column()
  declare country: string | null

  @column()
  declare isVerified: boolean

  @column()
  declare isFeatured: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => import('#models/user'))
  declare user: BelongsTo<typeof import('#models/user')>

  @hasMany(() => import('#models/product'))
  declare products: HasMany<typeof import('#models/product')>
}

