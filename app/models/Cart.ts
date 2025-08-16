import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasOne,HasMany,BelongsTo } from '@adonisjs/lucid/types/relations'

import User from './User.js'
import CartItem from './CartItem.js'

export default class Cart extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare sessionId: string 

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
  declare couponCode: string 

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => CartItem)
  declare items: HasMany<typeof CartItem>
}

