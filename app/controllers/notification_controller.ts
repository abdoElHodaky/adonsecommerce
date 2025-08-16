import { HttpContext } from '@adonisjs/core/http'
import Notification from '#models/notification'
import { NotificationType } from '#services/notification_service'

export default class NotificationController {
  /**
   * Get all notifications for the authenticated user
   */
  public async index({ auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized('User not authenticated')
    }

    const notifications = await Notification.query()
      .where('userId', user.id)
      .orderBy('createdAt', 'desc')
      .limit(50)

    return response.json(notifications)
  }

  /**
   * Get unread notifications count for the authenticated user
   */
  public async unreadCount({ auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized('User not authenticated')
    }

    const count = await Notification.query()
      .where('userId', user.id)
      .where('read', false)
      .count('* as total')

    return response.json({ count: count[0].$extras.total })
  }

  /**
   * Mark a notification as read
   */
  public async markAsRead({ auth, request, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized('User not authenticated')
    }

    const notificationId = request.param('id')

    const notification = await Notification.query()
      .where('id', notificationId)
      .where('userId', user.id)
      .first()

    if (!notification) {
      return response.notFound('Notification not found')
    }

    notification.read = true
    await notification.save()

    return response.json(notification)
  }

  /**
   * Mark all notifications as read
   */
  public async markAllAsRead({ auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized('User not authenticated')
    }

    await Notification.query()
      .where('userId', user.id)
      .where('read', false)
      .update({ read: true })

    return response.json({ success: true })
  }

  /**
   * Delete a notification
   */
  public async delete({ auth, request, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized('User not authenticated')
    }

    const notificationId = request.param('id')

    const notification = await Notification.query()
      .where('id', notificationId)
      .where('userId', user.id)
      .first()

    if (!notification) {
      return response.notFound('Notification not found')
    }

    await notification.delete()

    return response.json({ success: true })
  }

  /**
   * Delete all notifications
   */
  public async deleteAll({ auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized('User not authenticated')
    }

    await Notification.query().where('userId', user.id).delete()

    return response.json({ success: true })
  }
}

