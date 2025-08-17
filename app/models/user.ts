import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, HasOne, beforeSave } from '@adonisjs/lucid/orm'
import { compose } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'
import { withAuthFinder } from '@adonisjs/auth/mixins'
import type { Merchant } from '#models/merchant'

export type UserRole = 'admin' | 'merchant' | 'customer'

export default class User extends compose(BaseModel, withAuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare rememberMeToken: string | null

  @column()
  declare role: UserRole

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasOne(() => import('#models/merchant'))
  declare merchant: HasOne<typeof import('#models/merchant')>

  @beforeSave()
  static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await hash.make(user.password)
    }
  }
}

