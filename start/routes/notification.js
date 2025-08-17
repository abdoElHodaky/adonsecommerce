import router from '@adonisjs/core/services/router';
import { middleware } from './kernel.js';
const NotificationController = () => import('#controllers/notification_controller');
router
    .group(() => {
    router.get('/', [NotificationController, 'index']);
    router.get('/unread-count', [NotificationController, 'unreadCount']);
    router.post('/:id/mark-as-read', [NotificationController, 'markAsRead']);
    router.post('/mark-all-as-read', [NotificationController, 'markAllAsRead']);
    router.delete('/:id', [NotificationController, 'delete']);
    router.delete('/', [NotificationController, 'deleteAll']);
})
    .prefix('/api/notifications')
    .use(middleware.auth({ guards: ['web'] }));
//# sourceMappingURL=notification.js.map