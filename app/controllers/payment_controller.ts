import { HttpContext } from '@adonisjs/core/http'
import paymentService, { PaymentGateway, PaymentMethod, PaymentStatus } from '#services/payment_service'
import Order from '#models/order'
import { Exception } from '@adonisjs/core/exceptions'
import BaseController from './base_controller.js'
import notificationService from '#services/notification_service'

export default class PaymentController extends BaseController {
  /**
   * Process a payment for an order
   */
  public async processPayment({ request, response, session }: HttpContext) {
    return this.tryOrError(
      { request, response, session },
      async () => {
        const orderId = request.input('order_id')
        const paymentMethod = request.input('payment_method')

        // Find the order
        const order = await Order.findOrFail(orderId)

        // Check if the order is already paid
        if (order.paymentStatus === PaymentStatus.COMPLETED) {
          session.flash('error', 'This order has already been paid')
          return response.redirect().back()
        }

        // Process the payment based on the payment method
        if (paymentMethod === PaymentMethod.CREDIT_CARD) {
          // Get card details from the request
          const cardData = {
            amount: order.total,
            currency: 'USD', // Assuming USD as the default currency
            orderId: order.id.toString(),
            customerId: order.userId.toString(),
            description: `Payment for order #${order.orderNumber}`,
            cardNumber: request.input('card_number').replace(/\s+/g, ''),
            cardExpMonth: request.input('card_exp_month'),
            cardExpYear: request.input('card_exp_year'),
            cardCvc: request.input('card_cvc'),
            cardHolderName: request.input('card_holder_name'),
            metadata: {
              orderNumber: order.orderNumber,
            },
          }

          // Process the card payment
          const result = await paymentService.processCardPayment(cardData)

          if (result.success) {
            // Update the order with the payment information
            order.paymentStatus = result.status
            order.transactionId = result.transactionId
            order.paymentMethod = PaymentMethod.CREDIT_CARD
            order.paymentDetails = result.gatewayResponse
            await order.save()

            // Send payment notification
            notificationService.sendPaymentStatusUpdate(
              order.userId,
              order.id,
              order.orderNumber,
              result.status
            )

            session.flash('success', 'Payment processed successfully')
            return response.redirect().toRoute('customer.orderDetail', { id: order.id })
          } else {
            session.flash('error', result.message || 'Payment processing failed')
            return response.redirect().back()
          }
        } else if (paymentMethod === PaymentMethod.PAYPAL) {
          // Prepare PayPal payment data
          const paypalData = {
            amount: order.total,
            currency: 'USD',
            orderId: order.id.toString(),
            customerId: order.userId.toString(),
            description: `Payment for order #${order.orderNumber}`,
            returnUrl: `${request.completeUrl()}/paypal/return?order_id=${order.id}`,
            cancelUrl: `${request.completeUrl()}/paypal/cancel?order_id=${order.id}`,
            metadata: {
              orderNumber: order.orderNumber,
            },
          }

          // Process the PayPal payment
          const result = await paymentService.processPayPalPayment(paypalData)

          if (result.success && result.redirectUrl) {
            // Update the order with the payment information
            order.paymentStatus = result.status
            order.transactionId = result.transactionId
            order.paymentMethod = PaymentMethod.PAYPAL
            order.paymentDetails = result.gatewayResponse
            await order.save()

            // Send payment notification
            notificationService.sendPaymentStatusUpdate(
              order.userId,
              order.id,
              order.orderNumber,
              result.status
            )

            // Redirect to PayPal for payment approval
            return response.redirect(result.redirectUrl)
          } else {
            session.flash('error', result.message || 'PayPal checkout failed')
            return response.redirect().back()
          }
        } else {
          session.flash('error', 'Invalid payment method')
          return response.redirect().back()
        }
      },
      'An error occurred while processing your payment'
    )
  }

  /**
   * Handle PayPal payment return
   */
  public async handlePayPalReturn({ request, response, session }: HttpContext) {
    return this.tryOrError(
      { request, response, session },
      async () => {
        const orderId = request.input('order_id')
        const paypalOrderId = request.input('token')

        // Find the order
        const order = await Order.findOrFail(orderId)

        // Verify that this is the correct PayPal order
        if (order.transactionId !== paypalOrderId) {
          throw new Exception('Invalid PayPal transaction')
        }

        // Capture the PayPal payment
        const result = await paymentService.capturePayPalPayment(paypalOrderId)

        if (result.success) {
          // Update the order with the payment information
          order.paymentStatus = result.status
          order.paymentDetails = { ...order.paymentDetails, capture: result.gatewayResponse }
          await order.save()

          // Send payment notification
          notificationService.sendPaymentStatusUpdate(
            order.userId,
            order.id,
            order.orderNumber,
            result.status
          )

          session.flash('success', 'Payment completed successfully')
          return response.redirect().toRoute('customer.orderDetail', { id: order.id })
        } else {
          session.flash('error', result.message || 'Payment capture failed')
          return response.redirect().toRoute('customer.orderDetail', { id: order.id })
        }
      },
      'An error occurred while completing your payment'
    )
  }

  /**
   * Handle PayPal payment cancellation
   */
  public async handlePayPalCancel({ request, response, session }: HttpContext) {
    return this.tryOrError(
      { request, response, session },
      async () => {
        const orderId = request.input('order_id')

        // Find the order
        const order = await Order.findOrFail(orderId)

        // Update the order status
        order.paymentStatus = PaymentStatus.FAILED
        order.paymentDetails = { ...order.paymentDetails, cancelled: true }
        await order.save()

        // Send payment notification
        notificationService.sendPaymentStatusUpdate(
          order.userId,
          order.id,
          order.orderNumber,
          PaymentStatus.FAILED
        )

        session.flash('info', 'Payment was cancelled')
        return response.redirect().toRoute('customer.orderDetail', { id: order.id })
      },
      'An error occurred while cancelling your payment'
    )
  }

  /**
   * Process a refund for an order
   */
  public async processRefund({ request, response, session, auth }: HttpContext) {
    return this.tryOrError(
      { request, response, session, auth },
      async () => {
        // Check if the user is authorized to process refunds
        if (!auth.user || !['admin', 'merchant'].includes(auth.user.userType)) {
          return this.forbidden({ request, response, session, auth }, 'You are not authorized to process refunds')
        }

        const orderId = request.input('order_id')
        const amount = request.input('amount')
        const reason = request.input('reason')

        // Find the order
        const order = await Order.findOrFail(orderId)

        // Check if the order can be refunded
        if (order.paymentStatus !== PaymentStatus.COMPLETED) {
          session.flash('error', 'This order cannot be refunded')
          return response.redirect().back()
        }

        // If the user is a merchant, check if they own the products in the order
        if (auth.user.userType === 'merchant') {
          const hasProducts = await order.related('items').query()
            .whereHas('product', (query) => {
              query.where('merchantId', auth.user.merchant.id)
            })
            .first()

          if (!hasProducts) {
            return this.forbidden({ request, response, session, auth }, 'You can only refund orders for your products')
          }
        }

        // Process the refund
        const result = await paymentService.refundPayment(
          order.transactionId!,
          amount || order.total,
          reason
        )

        if (result.success) {
          // Update the order with the refund information
          order.paymentStatus = result.status
          order.paymentDetails = { ...order.paymentDetails, refund: result.gatewayResponse }
          await order.save()

          // Send payment notification
          notificationService.sendPaymentStatusUpdate(
            order.userId,
            order.id,
            order.orderNumber,
            result.status
          )

          session.flash('success', 'Refund processed successfully')
          return response.redirect().back()
        } else {
          session.flash('error', result.message || 'Refund processing failed')
          return response.redirect().back()
        }
      },
      'An error occurred while processing the refund'
    )
  }
}

