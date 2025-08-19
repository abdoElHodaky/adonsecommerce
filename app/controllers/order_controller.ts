import { HttpContext } from '@adonisjs/core/http'
import BaseController from './base_controller.js'
import Order from '#models/order'
import OrderItem from '#models/order_item'
import Product from '#models/product'
import Cart from '#models/cart'
import  validator from '#start/validator'
//import { schema, validator } from '@adonisjs/core/validator'
import notificationService from '#services/notification_service'

export default class OrderController extends BaseController {
  /**
   * Display a listing of the customer's orders
   */
  public async index({ view, auth }: HttpContext) {
    return this.tryOrError(
      { view, auth },
      async () => {
        if (!auth.user) {
          return this.unauthorized({ view, auth })
        }

        const orders = await Order.query()
          .where('userId', auth.user.id)
          .preload('items', (query) => {
            query.preload('product')
          })
          .orderBy('createdAt', 'desc')
          .paginate(1, 10)

        return view.render('customer/orders/index', { orders })
      },
      'Failed to load orders'
    )
  }

  /**
   * Display the specified order
   */
  public async show({ params, view, auth }: HttpContext) {
    return this.tryOrError(
      { params, view, auth },
      async () => {
        if (!auth.user) {
          return this.unauthorized({ params, view, auth })
        }

        const order = await Order.query()
          .where('id', params.id)
          .where('userId', auth.user.id)
          .preload('items', (query) => {
            query.preload('product', (productQuery) => {
              productQuery.preload('merchant')
            })
          })
          .firstOrFail()

        return view.render('customer/orders/show', { order })
      },
      'Failed to load order details'
    )
  }

  /**
   * Create a new order from the cart
   */
  public async store({ request, response, session, auth }: HttpContext) {
    return this.tryOrError(
      { request, response, session, auth },
      async () => {
        if (!auth.user) {
          return this.unauthorized({ request, response, session, auth })
        }

        // Get the user's cart
        const cart = await Cart.query()
          .where('userId', auth.user.id)
          .preload('items', (query) => {
            query.preload('product')
          })
          .firstOrFail()

        // Check if the cart is empty
        if (cart.items.length === 0) {
          session.flash('error', 'Your cart is empty')
          return response.redirect().toRoute('store.cart')
        }

        // Validate the request
        const orderSchema = schema.create({
          shippingAddress: schema.string(),
          shippingCity: schema.string(),
          shippingState: schema.string(),
          shippingZip: schema.string(),
          shippingCountry: schema.string(),
          paymentMethod: schema.string(),
        })

        const data = await validator.validate({
          schema: orderSchema,
          data: request.only([
            'shippingAddress',
            'shippingCity',
            'shippingState',
            'shippingZip',
            'shippingCountry',
            'paymentMethod',
          ]),
        })

        // Calculate the order total
        let total = 0
        for (const item of cart.items) {
          total += item.product.price * item.quantity
        }

        // Create the order
        const order = await Order.create({
          userId: auth.user.id,
          total,
          status: 'pending',
          paymentStatus: 'pending',
          ...data,
          orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        })

        // Create order items
        for (const item of cart.items) {
          await OrderItem.create({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
            total: item.product.price * item.quantity,
          })

          // Update product stock
          const product = await Product.findOrFail(item.productId)
          product.stock -= item.quantity
          product.soldCount = (product.soldCount || 0) + item.quantity
          await product.save()

          // Send notification to merchant
          if (product.merchantId) {
            notificationService.sendNewOrderNotification(
              product.merchantId,
              order.id,
              order.orderNumber,
              order.total
            )
          }
        }

        // Clear the cart
        await cart.related('items').query().delete()

        // Send notification to customer
        notificationService.sendOrderStatusUpdate(
          auth.user.id,
          order.id,
          order.orderNumber,
          'pending'
        )

        session.flash('success', 'Order placed successfully')
        return response.redirect().toRoute('payment.process', { order_id: order.id })
      },
      'Failed to create order'
    )
  }

  /**
   * Cancel the specified order
   */
  public async cancel({ params, response, session, auth }: HttpContext) {
    return this.tryOrError(
      { params, response, session, auth },
      async () => {
        if (!auth.user) {
          return this.unauthorized({ params, response, session, auth })
        }

        const order = await Order.query()
          .where('id', params.id)
          .where('userId', auth.user.id)
          .firstOrFail()

        // Check if the order can be cancelled
        if (!['pending', 'processing'].includes(order.status)) {
          session.flash('error', 'This order cannot be cancelled')
          return response.redirect().back()
        }

        // Update the order status
        order.status = 'cancelled'
        await order.save()

        // Send notification to customer
        notificationService.sendOrderStatusUpdate(
          auth.user.id,
          order.id,
          order.orderNumber,
          'cancelled'
        )

        session.flash('success', 'Order cancelled successfully')
        return response.redirect().back()
      },
      'Failed to cancel order'
    )
  }

  /**
   * Display a listing of the merchant's orders
   */
  public async merchantOrders({ view, auth }: HttpContext) {
    return this.tryOrError(
      { view, auth },
      async () => {
        if (!auth.user || auth.user.userType !== 'merchant') {
          return this.forbidden({ view, auth }, 'Only merchants can access this page')
        }

        const orders = await Order.query()
          .whereHas('items', (query) => {
            query.whereHas('product', (productQuery) => {
              productQuery.where('merchantId', auth.user.merchant.id)
            })
          })
          .preload('user')
          .preload('items', (query) => {
            query.preload('product', (productQuery) => {
              productQuery.where('merchantId', auth.user.merchant.id)
            })
          })
          .orderBy('createdAt', 'desc')
          .paginate(1, 10)

        return view.render('merchant/orders/index', { orders })
      },
      'Failed to load merchant orders'
    )
  }

  /**
   * Display the specified merchant order
   */
  public async merchantOrderShow({ params, view, auth }: HttpContext) {
    return this.tryOrError(
      { params, view, auth },
      async () => {
        if (!auth.user || auth.user.userType !== 'merchant') {
          return this.forbidden({ params, view, auth }, 'Only merchants can access this page')
        }

        const order = await Order.query()
          .where('id', params.id)
          .preload('user')
          .preload('items', (query) => {
            query.preload('product', (productQuery) => {
              productQuery.where('merchantId', auth.user.merchant.id)
            })
          })
          .firstOrFail()

        // Check if the order contains products from this merchant
        if (order.items.length === 0) {
          return this.notFound({ params, view, auth }, 'Order not found')
        }

        return view.render('merchant/orders/show', { order })
      },
      'Failed to load merchant order details'
    )
  }

  /**
   * Update the status of a merchant order
   */
  public async updateStatus({ params, request, response, session, auth }: HttpContext) {
    return this.tryOrError(
      { params, request, response, session, auth },
      async () => {
        if (!auth.user || auth.user.userType !== 'merchant') {
          return this.forbidden({ params, request, response, session, auth }, 'Only merchants can update order status')
        }

        const order = await Order.query()
          .where('id', params.id)
          .preload('user')
          .preload('items', (query) => {
            query.preload('product', (productQuery) => {
              productQuery.where('merchantId', auth.user.merchant.id)
            })
          })
          .firstOrFail()

        // Check if the order contains products from this merchant
        if (order.items.length === 0) {
          return this.notFound({ params, request, response, session, auth }, 'Order not found')
        }

        // Validate the request
        const statusSchema = schema.create({
          status: schema.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
        })

        const data = await validator.validate({
          schema: statusSchema,
          data: request.only(['status']),
        })

        // Update the order status
        order.status = data.status
        await order.save()

        // Send notification to customer
        notificationService.sendOrderStatusUpdate(
          order.userId,
          order.id,
          order.orderNumber,
          data.status
        )

        session.flash('success', 'Order status updated successfully')
        return response.redirect().back()
      },
      'Failed to update order status'
    )
  }
}

