import { HttpContext } from '@adonisjs/core/http'
import Order, { OrderStatus } from '#models/Order'
import OrderItem from '#models/OrderItem'
import Cart from '#models/Cart'
import CartItem from '#models/CartItem'
import Product from '#models/Product'
import Merchant from '#models/Merchant'
import vine from '@vinejs/vine'
import { string } from '@vinejs/vine/rules'

export default class OrderController {
  /**
   * Display a listing of customer orders
   */
  async index({ view, auth, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = 10
    const status = request.input('status', 'all')

    const user = auth.user!

    // Build query
    const ordersQuery = Order.query()
      .where('userId', user.id)
      .preload('merchant')

    // Apply status filter
    if (status !== 'all') {
      ordersQuery.where('status', status)
    }

    // Get paginated results
    const orders = await ordersQuery.orderBy('createdAt', 'desc').paginate(page, limit)

    return view.render('pages/customer/orders/index', {
      orders,
      status,
    })
  }

  /**
   * Display the specified order
   */
  async show({ view, params, auth, response }: HttpContext) {
    try {
      const user = auth.user!

      const order = await Order.query()
        .where('id', params.id)
        .where('userId', user.id)
        .preload('merchant')
        .preload('items', (query) => query.preload('product'))
        .firstOrFail()

      return view.render('pages/customer/orders/show', {
        order,
      })
    } catch (error) {
      return response.status(404).redirect('/customer/orders')
    }
  }

  /**
   * Show the checkout page
   */
  async checkout({ view, auth, response, session }: HttpContext) {
    try {
      const user = auth.user!

      // Get user's cart
      const cart = await Cart.query()
        .where('userId', user.id)
        .preload('items', (query) => {
          query.preload('product')
          query.preload('productVariant')
          query.preload('merchant')
        })
        .firstOrFail()

      // Check if cart is empty
      if (cart.items.length === 0) {
        session.flash('error', 'Your cart is empty')
        return response.redirect('/store/cart')
      }

      return view.render('pages/store/checkout', {
        cart,
        user,
      })
    } catch (error) {
      session.flash('error', 'Your cart is empty')
      return response.redirect('/store/cart')
    }
  }

  /**
   * Process the order
   */
  async processOrder({ request, response, auth, session }: HttpContext) {
    const user = auth.user!

    // Validate input
    const checkoutSchema = vine.object({
      shipping_address: vine.string().trim(),
      billing_address: vine.string().trim(),
      payment_method: vine.string().in(['credit_card', 'paypal']),
      // Add more fields as needed for payment processing
    })

    try {
      const payload = await vine.validate({
        schema: checkoutSchema,
        data: request.all(),
      })

      // Get user's cart
      const cart = await Cart.query()
        .where('userId', user.id)
        .preload('items', (query) => {
          query.preload('product')
          query.preload('productVariant')
          query.preload('merchant')
        })
        .firstOrFail()

      // Check if cart is empty
      if (cart.items.length === 0) {
        session.flash('error', 'Your cart is empty')
        return response.redirect('/store/cart')
      }

      // Group cart items by merchant
      const merchantItems = {}
      for (const item of cart.items) {
        if (!merchantItems[item.merchantId]) {
          merchantItems[item.merchantId] = []
        }
        merchantItems[item.merchantId].push(item)
      }

      // Create an order for each merchant
      const orders = []
      for (const merchantId in merchantItems) {
        const items = merchantItems[merchantId]
        const merchant = items[0].merchant

        // Calculate order totals
        let subtotal = 0
        for (const item of items) {
          subtotal += item.subtotal
        }

        const tax = subtotal * 0.1 // 10% tax (simplified)
        const shipping = 10 // Flat shipping rate (simplified)
        const total = subtotal + tax + shipping

        // Create order
        const order = new Order()
        order.userId = user.id
        order.merchantId = parseInt(merchantId)
        order.orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        order.status = OrderStatus.PENDING
        order.subtotal = subtotal
        order.tax = tax
        order.shipping = shipping
        order.discount = 0
        order.total = total
        order.shippingAddress = payload.shipping_address
        order.billingAddress = payload.billing_address
        order.paymentMethod = payload.payment_method
        order.paymentStatus = 'pending'

        await order.save()
        orders.push(order)

        // Create order items
        for (const item of items) {
          const orderItem = new OrderItem()
          orderItem.orderId = order.id
          orderItem.productId = item.productId
          orderItem.productVariantId = item.productVariantId
          orderItem.name = item.product.name
          orderItem.sku = item.product.sku
          orderItem.price = item.price
          orderItem.quantity = item.quantity
          orderItem.subtotal = item.subtotal
          orderItem.options = item.options

          await orderItem.save()

          // Update product quantity
          const product = await Product.find(item.productId)
          if (product && product.isManageStock) {
            product.quantity -= item.quantity
            await product.save()
          }
        }
      }

      // Clear the cart
      await cart.delete()

      // In a real app, you would process payment here
      // For now, we'll just redirect to the order confirmation page

      session.flash('success', 'Order placed successfully')
      return response.redirect(`/customer/orders/${orders[0].id}`)
    } catch (error) {
      session.flash('errors', error.messages || { error: 'Failed to process order' })
      return response.redirect().back()
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder({ response, params, auth, session }: HttpContext) {
    try {
      const user = auth.user!

      const order = await Order.query()
        .where('id', params.id)
        .where('userId', user.id)
        .where('status', 'pending')
        .firstOrFail()

      // Update order status
      order.status = OrderStatus.CANCELLED
      await order.save()

      // In a real app, you would handle refunds here if payment was already processed

      session.flash('success', 'Order cancelled successfully')
      return response.redirect(`/customer/orders/${order.id}`)
    } catch (error) {
      session.flash('error', 'Failed to cancel order')
      return response.redirect().back()
    }
  }
}

