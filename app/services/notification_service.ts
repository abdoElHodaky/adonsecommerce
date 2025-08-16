import { Server as SocketServer } from 'socket.io'
import { Server as HttpServer } from 'node:http'
import { Exception } from '@adonisjs/core/exceptions'

/**
 * Notification types
 */
export enum NotificationType {
  ORDER_STATUS = 'order_status',
  PAYMENT_STATUS = 'payment_status',
  NEW_MESSAGE = 'new_message',
  SYSTEM = 'system',
}

/**
 * Notification data interface
 */
export interface NotificationData {
  id?: string
  type: NotificationType
  title: string
  message: string
  data?: any
  createdAt?: Date
  read?: boolean
}

/**
 * Notification service class
 */
export class NotificationService {
  /**
   * Socket.io server instance
   */
  private io: SocketServer | null = null

  /**
   * Initialize the notification service with a Socket.io server
   */
  public initialize(server: HttpServer) {
    this.io = new SocketServer(server, {
      cors: {
        origin: '*', // In production, this should be restricted to your domain
        methods: ['GET', 'POST'],
      },
    })

    this.setupSocketHandlers()
  }

  /**
   * Set up Socket.io event handlers
   */
  private setupSocketHandlers() {
    if (!this.io) {
      throw new Exception('Socket.io server not initialized')
    }

    this.io.on('connection', (socket) => {
      console.log('New client connected:', socket.id)

      // Handle user authentication
      socket.on('authenticate', (data) => {
        if (data.userId) {
          // Associate this socket with the user ID
          socket.join(`user:${data.userId}`)
          console.log(`User ${data.userId} authenticated`)

          // If the user is a merchant, join the merchant room
          if (data.merchantId) {
            socket.join(`merchant:${data.merchantId}`)
            console.log(`Merchant ${data.merchantId} authenticated`)
          }

          // If the user is an admin, join the admin room
          if (data.isAdmin) {
            socket.join('admin')
            console.log('Admin authenticated')
          }
        }
      })

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })
  }

  /**
   * Send a notification to a specific user
   */
  public sendToUser(userId: string | number, notification: NotificationData) {
    if (!this.io) {
      throw new Exception('Socket.io server not initialized')
    }

    // Generate a unique ID for the notification if not provided
    if (!notification.id) {
      notification.id = `notification_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    }

    // Set the creation timestamp if not provided
    if (!notification.createdAt) {
      notification.createdAt = new Date()
    }

    // Set the read status if not provided
    if (notification.read === undefined) {
      notification.read = false
    }

    // Send the notification to the user's room
    this.io.to(`user:${userId}`).emit('notification', notification)

    return notification
  }

  /**
   * Send a notification to a specific merchant
   */
  public sendToMerchant(merchantId: string | number, notification: NotificationData) {
    if (!this.io) {
      throw new Exception('Socket.io server not initialized')
    }

    // Generate a unique ID for the notification if not provided
    if (!notification.id) {
      notification.id = `notification_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    }

    // Set the creation timestamp if not provided
    if (!notification.createdAt) {
      notification.createdAt = new Date()
    }

    // Set the read status if not provided
    if (notification.read === undefined) {
      notification.read = false
    }

    // Send the notification to the merchant's room
    this.io.to(`merchant:${merchantId}`).emit('notification', notification)

    return notification
  }

  /**
   * Send a notification to all admins
   */
  public sendToAdmins(notification: NotificationData) {
    if (!this.io) {
      throw new Exception('Socket.io server not initialized')
    }

    // Generate a unique ID for the notification if not provided
    if (!notification.id) {
      notification.id = `notification_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    }

    // Set the creation timestamp if not provided
    if (!notification.createdAt) {
      notification.createdAt = new Date()
    }

    // Set the read status if not provided
    if (notification.read === undefined) {
      notification.read = false
    }

    // Send the notification to the admin room
    this.io.to('admin').emit('notification', notification)

    return notification
  }

  /**
   * Send a notification to all connected clients
   */
  public broadcast(notification: NotificationData) {
    if (!this.io) {
      throw new Exception('Socket.io server not initialized')
    }

    // Generate a unique ID for the notification if not provided
    if (!notification.id) {
      notification.id = `notification_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    }

    // Set the creation timestamp if not provided
    if (!notification.createdAt) {
      notification.createdAt = new Date()
    }

    // Set the read status if not provided
    if (notification.read === undefined) {
      notification.read = false
    }

    // Broadcast the notification to all connected clients
    this.io.emit('notification', notification)

    return notification
  }

  /**
   * Send an order status update notification
   */
  public sendOrderStatusUpdate(
    userId: string | number,
    orderId: string | number,
    orderNumber: string,
    status: string
  ) {
    return this.sendToUser(userId, {
      type: NotificationType.ORDER_STATUS,
      title: 'Order Status Update',
      message: `Your order #${orderNumber} has been updated to: ${status}`,
      data: {
        orderId,
        orderNumber,
        status,
      },
    })
  }

  /**
   * Send a payment status update notification
   */
  public sendPaymentStatusUpdate(
    userId: string | number,
    orderId: string | number,
    orderNumber: string,
    status: string
  ) {
    return this.sendToUser(userId, {
      type: NotificationType.PAYMENT_STATUS,
      title: 'Payment Status Update',
      message: `Payment for order #${orderNumber} has been updated to: ${status}`,
      data: {
        orderId,
        orderNumber,
        status,
      },
    })
  }

  /**
   * Send a new order notification to a merchant
   */
  public sendNewOrderNotification(
    merchantId: string | number,
    orderId: string | number,
    orderNumber: string,
    total: number
  ) {
    return this.sendToMerchant(merchantId, {
      type: NotificationType.ORDER_STATUS,
      title: 'New Order Received',
      message: `You have received a new order #${orderNumber} for $${total.toFixed(2)}`,
      data: {
        orderId,
        orderNumber,
        total,
      },
    })
  }

  /**
   * Send a new message notification
   */
  public sendNewMessageNotification(
    userId: string | number,
    senderId: string | number,
    senderName: string,
    messageId: string | number,
    messagePreview: string
  ) {
    return this.sendToUser(userId, {
      type: NotificationType.NEW_MESSAGE,
      title: 'New Message',
      message: `You have received a new message from ${senderName}`,
      data: {
        senderId,
        senderName,
        messageId,
        messagePreview,
      },
    })
  }

  /**
   * Send a system notification to a user
   */
  public sendSystemNotification(userId: string | number, title: string, message: string, data?: any) {
    return this.sendToUser(userId, {
      type: NotificationType.SYSTEM,
      title,
      message,
      data,
    })
  }
}

// Export a singleton instance
export default new NotificationService()

