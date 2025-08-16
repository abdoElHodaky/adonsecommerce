import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, hasOne ,beforeSave} from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import type { HasOne } from '@adonisjs/lucid/types/relations'

import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import hash from '@adonisjs/core/services/hash'
import Merchant from './Merchant.js'
import Order from './Order.js'
import Review from './Review.js'
import Cart from './Cart.js'

export const UserType = {
  ADMIN: 'admin',
  MERCHANT: 'merchant',
  CUSTOMER: 'customer',
} as const

export type UserTypeValues = typeof UserType[keyof typeof UserType]

export default class User extends withAuthFinder(BaseModel, {
  uids: ['email'],
  passwordColumnName: 'pass_word',
}) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare firstName: string

  @column()
  declare lastName: string

  @column()
  declare email: string

  @column()
  declare pass_word: string 

  @column()
  declare phone: string 

  @column()
  declare avatar: string 

  @column()
  declare userType: UserTypeValues

  @column()
  declare isActive: boolean

  @column()
  declare rememberMeToken: string 

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasOne(() => Merchant)
  declare merchant: HasOne<typeof Merchant>

  @hasMany(() => Order)
  declare orders: HasMany<typeof Order>

  @hasMany(() => Review)
  declare reviews: HasMany<typeof Review>

  @hasMany(() => Cart)
  declare carts: HasMany<typeof Cart>
  
  //super.boot()
  @beforeSave()
  static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.pass_word = await hash.make(user.pass_word)
    }
  }
 /* public static boot(){
    if(this.booted){return;}
      super.boot();
  }*/
}

