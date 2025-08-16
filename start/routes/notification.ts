import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

// Notification routes
const NotificationController = () => import('#controllers/notification_controller')

router
  .group(() => {
    // Get all notifications
    router.get('/', [NotificationController, 'index'])

    // Get unread notifications count
    router.get('/unread-count', [NotificationController, 'unreadCount'])

    // Mark notification as read
    router.post('/:id/mark-as-read', [NotificationController, 'markAsRead'])

    // Mark all notifications as read
    router.post('/mark-all-as-read', [NotificationController, 'markAllAsRead'])

    // Delete notification
    router.delete('/:id', [NotificationController, 'delete'])

    // Delete all notifications
    router.delete('/', [NotificationController, 'deleteAll'])
  })
  .prefix('/api/notifications')
  .use(middleware.auth({ guards: ['web'] }))

