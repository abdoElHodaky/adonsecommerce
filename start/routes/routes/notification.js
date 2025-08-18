"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("@adonisjs/core/services/router");
const kernel_js_1 = require("./kernel.js");
// Notification routes
const NotificationController = () => Promise.resolve().then(() => require('#controllers/notification_controller'));
router_1.default
    .group(() => {
    // Get all notifications
    router_1.default.get('/', [NotificationController, 'index']);
    // Get unread notifications count
    router_1.default.get('/unread-count', [NotificationController, 'unreadCount']);
    // Mark notification as read
    router_1.default.post('/:id/mark-as-read', [NotificationController, 'markAsRead']);
    // Mark all notifications as read
    router_1.default.post('/mark-all-as-read', [NotificationController, 'markAllAsRead']);
    // Delete notification
    router_1.default.delete('/:id', [NotificationController, 'delete']);
    // Delete all notifications
    router_1.default.delete('/', [NotificationController, 'deleteAll']);
})
    .prefix('/api/notifications')
    .use(kernel_js_1.middleware.auth({ guards: ['web'] }));
