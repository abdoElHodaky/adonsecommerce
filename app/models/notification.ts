import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import { NotificationType } from '#services/notification_service'

export default class Notification extends BaseModel {
  /**
   * Table name
   */
  static table = 'notifications'

  /**
   * Primary key
   */
  @column({ isPrimary: true })
  declare id: number

  /**
   * User ID
   */
  @column()
  declare userId: number

  /**
   * Notification type
   */
  @column()
  declare type: NotificationType

  /**
   * Notification title
   */
  @column()
  declare title: string

  /**
   * Notification message
   */
  @column()
  declare message: string

  /**
   * Additional data
   */
  @column({ prepare: (value) => JSON.stringify(value), consume: (value) => JSON.parse(value) })
  declare data: any

  /**
   * Read status
   */
  @column()
  declare read: boolean

  /**
   * Created at timestamp
   */
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  /**
   * Updated at timestamp
   */
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /**
   * User relationship
   */
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}

