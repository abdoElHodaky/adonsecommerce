import { HttpContext } from '@adonisjs/core/http'
import Notification from '#models/notification'
import { NotificationType } from '#services/notification_service'
import BaseController from './base_controller.js'

export default class NotificationController extends BaseController {
  /**
   * Get all notifications for the authenticated user
   */
  public async index({ auth, response }: HttpContext) {
    return this.tryOrError(
      { auth, response },
      async () => {
        const user = auth.user
        if (!user) {
          return this.unauthorized({ auth, response })
        }

        const notifications = await Notification.query()
          .where('userId', user.id)
          .orderBy('createdAt', 'desc')
          .limit(50)

        return response.json(notifications)
      },
      'Failed to fetch notifications'
    )
  }

  /**
   * Get unread notifications count for the authenticated user
   */
  public async unreadCount({ auth, response }: HttpContext) {
    return this.tryOrError(
      { auth, response },
      async () => {
        const user = auth.user
        if (!user) {
          return this.unauthorized({ auth, response })
        }

        const count = await Notification.query()
          .where('userId', user.id)
          .where('read', false)
          .count('* as total')

        return response.json({ count: count[0].$extras.total })
      },
      'Failed to fetch unread notification count'
    )
  }

  /**
   * Mark a notification as read
   */
  public async markAsRead({ auth, request, response }: HttpContext) {
    return this.tryOrError(
      { auth, request, response },
      async () => {
        const user = auth.user
        if (!user) {
          return this.unauthorized({ auth, request, response })
        }

        const notificationId = request.param('id')

        const notification = await Notification.query()
          .where('id', notificationId)
          .where('userId', user.id)
          .first()

        if (!notification) {
          return this.notFound({ auth, request, response }, 'Notification not found')
        }

        notification.read = true
        await notification.save()

        return response.json(notification)
      },
      'Failed to mark notification as read'
    )
  }

  /**
   * Mark all notifications as read
   */
  public async markAllAsRead({ auth, response }: HttpContext) {
    return this.tryOrError(
      { auth, response },
      async () => {
        const user = auth.user
        if (!user) {
          return this.unauthorized({ auth, response })
        }

        await Notification.query()
          .where('userId', user.id)
          .where('read', false)
          .update({ read: true })

        return response.json({ success: true })
      },
      'Failed to mark all notifications as read'
    )
  }

  /**
   * Delete a notification
   */
  public async delete({ auth, request, response }: HttpContext) {
    return this.tryOrError(
      { auth, request, response },
      async () => {
        const user = auth.user
        if (!user) {
          return this.unauthorized({ auth, request, response })
        }

        const notificationId = request.param('id')

        const notification = await Notification.query()
          .where('id', notificationId)
          .where('userId', user.id)
          .first()

        if (!notification) {
          return this.notFound({ auth, request, response }, 'Notification not found')
        }

        await notification.delete()

        return response.json({ success: true })
      },
      'Failed to delete notification'
    )
  }

  /**
   * Delete all notifications
   */
  public async deleteAll({ auth, response }: HttpContext) {
    return this.tryOrError(
      { auth, response },
      async () => {
        const user = auth.user
        if (!user) {
          return this.unauthorized({ auth, response })
        }

        await Notification.query().where('userId', user.id).delete()

        return response.json({ success: true })
      },
      'Failed to delete all notifications'
    )
  }
}
