import { HttpContext } from '@adonisjs/core/http'
import Cart from '#models/Cart'
import CartItem from '#models/CartItem'
import Product from '#models/Product'
import ProductVariant from '#models/ProductVariant'
import  validator from '#start/validator'
import BaseController from './base_controller.js'

export default class CartController extends BaseController {
  /**
   * Display the cart
   */
  async index({ view, auth, session }: HttpContext) {
    return this.tryOrError(
      { view, auth, session },
      async () => {
        let cart

        if (auth.isAuthenticated) {
          // Get cart for authenticated user
          const user = auth.user!
          cart = await Cart.query()
            .where('userId', user.id)
            .preload('items', (query) => {
              query.preload('product')
              query.preload('productVariant')
              query.preload('merchant')
            })
            .first()
        } else {
          // Get cart for guest user using session ID
          const sessionId = session.sessionId
          cart = await Cart.query()
            .where('sessionId', sessionId)
            .preload('items', (query) => {
              query.preload('product')
              query.preload('productVariant')
              query.preload('merchant')
            })
            .first()
        }

        return view.render('pages/store/cart', {
          cart,
        })
      },
      'Failed to load cart'
    )
  }

  /**
   * Add item to cart
   */
  async addToCart({ request, response, auth, session }: HttpContext) {
    return this.tryOrError(
      { request, response, auth, session },
      async () => {
        // Validate input
        const cartSchema = schema.create({
          product_id: schema.number([
            validator.unsigned()
          ]),
          variant_id: schema.number.optional([
            validator.unsigned()
          ]),
          quantity: schema.number.optional([
            validator.unsigned()
          ]),
          options: schema.string.optional(),
        })

        const payload = await validator.validate({
          schema: cartSchema,
          data: request.all(),
        })

        // Get product
        const product = await Product.query()
          .where('id', payload.product_id)
          .where('isPublished', true)
          .preload('merchant')
          .firstOrFail()

        // Get variant if specified
        let variant = null
        if (payload.variant_id) {
          variant = await ProductVariant.query()
            .where('id', payload.variant_id)
            .where('productId', product.id)
            .where('isActive', true)
            .firstOrFail()
        }

        // Check stock availability
        const itemPrice = variant ? variant.price : product.price
        const availableQuantity = variant ? variant.quantity : product.quantity
        const quantity = payload.quantity || 1
        
        if (product.isManageStock && quantity > availableQuantity) {
          session.flash('error', 'The requested quantity is not available')
          return response.redirect().back()
        }

        // Get or create cart
        let cart
        if (auth.isAuthenticated) {
          // Get cart for authenticated user
          const user = auth.user!
          cart = await Cart.firstOrCreate({ userId: user.id }, {
            userId: user.id,
            sessionId: null,
            subtotal: 0,
            tax: 0,
            shipping: 0,
            discount: 0,
            total: 0,
          })
        } else {
          // Get cart for guest user using session ID
          const sessionId = session.sessionId
          cart = await Cart.firstOrCreate({ sessionId }, {
            userId: null,
            sessionId,
            subtotal: 0,
            tax: 0,
            shipping: 0,
            discount: 0,
            total: 0,
          })
        }

        // Check if item already exists in cart
        let cartItem = await CartItem.query()
          .where('cartId', cart.id)
          .where('productId', product.id)
          .where('productVariantId', payload.variant_id || null)
          .first()

        if (cartItem) {
          // Update existing cart item
          cartItem.quantity += quantity
          cartItem.subtotal = cartItem.quantity * itemPrice
          await cartItem.save()
        } else {
          // Create new cart item
          cartItem = new CartItem()
          cartItem.cartId = cart.id
          cartItem.productId = product.id
          cartItem.productVariantId = payload.variant_id || null
          cartItem.merchantId = product.merchantId
          cartItem.quantity = quantity
          cartItem.price = itemPrice
          cartItem.subtotal = quantity * itemPrice
          cartItem.options = payload.options || null
          await cartItem.save()
        }

        // Update cart totals
        await this.updateCartTotals(cart.id)

        session.flash('success', 'Item added to cart')
        return response.redirect('/store/cart')
      },
      'Failed to add item to cart'
    )
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem({ request, response, auth, session, params }: HttpContext) {
    return this.tryOrError(
      { request, response, auth, session, params },
      async () => {
        // Validate input
        const updateSchema = schema.create({
          quantity: schema.number([
            validator.unsigned()
          ]),
        })

        const payload = await validator.validate({
          schema: updateSchema,
          data: request.all(),
        })

        // Get cart item
        const cartItem = await CartItem.find(params.id)
        if (!cartItem) {
          return this.notFound({ request, response, auth, session, params }, 'Cart item not found')
        }

        // Get cart and verify ownership
        const cart = await Cart.find(cartItem.cartId)
        if (!cart) {
          return this.notFound({ request, response, auth, session, params }, 'Cart not found')
        }

        if (auth.isAuthenticated) {
          const user = auth.user!
          if (cart.userId !== user.id) {
            return this.forbidden({ request, response, auth, session, params }, 'You do not have permission to update this cart')
          }
        } else {
          const sessionId = session.sessionId
          if (cart.sessionId !== sessionId) {
            return this.forbidden({ request, response, auth, session, params }, 'You do not have permission to update this cart')
          }
        }

        // Check stock availability
        const product = await Product.find(cartItem.productId)
        if (!product) {
          return this.notFound({ request, response, auth, session, params }, 'Product not found')
        }

        let availableQuantity = product.quantity
        let itemPrice = product.price

        if (cartItem.productVariantId) {
          const variant = await ProductVariant.find(cartItem.productVariantId)
          if (variant) {
            availableQuantity = variant.quantity
            itemPrice = variant.price
          }
        }

        if (product.isManageStock && payload.quantity > availableQuantity) {
          session.flash('error', 'The requested quantity is not available')
          return response.redirect().back()
        }

        // Update cart item
        cartItem.quantity = payload.quantity
        cartItem.subtotal = payload.quantity * itemPrice
        await cartItem.save()

        // Update cart totals
        await this.updateCartTotals(cart.id)

        session.flash('success', 'Cart updated')
        return response.redirect('/store/cart')
      },
      'Failed to update cart'
    )
  }

  /**
   * Remove item from cart
   */
  async removeCartItem({ response, auth, session, params }: HttpContext) {
    return this.tryOrError(
      { response, auth, session, params },
      async () => {
        // Get cart item
        const cartItem = await CartItem.find(params.id)
        if (!cartItem) {
          return this.notFound({ response, auth, session, params }, 'Cart item not found')
        }

        // Get cart and verify ownership
        const cart = await Cart.find(cartItem.cartId)
        if (!cart) {
          return this.notFound({ response, auth, session, params }, 'Cart not found')
        }

        if (auth.isAuthenticated) {
          const user = auth.user!
          if (cart.userId !== user.id) {
            return this.forbidden({ response, auth, session, params }, 'You do not have permission to remove items from this cart')
          }
        } else {
          const sessionId = session.sessionId
          if (cart.sessionId !== sessionId) {
            return this.forbidden({ response, auth, session, params }, 'You do not have permission to remove items from this cart')
          }
        }

        // Delete cart item
        await cartItem.delete()

        // Update cart totals
        await this.updateCartTotals(cart.id)

        session.flash('success', 'Item removed from cart')
        return response.redirect('/store/cart')
      },
      'Failed to remove item from cart'
    )
  }

  /**
   * Clear cart
   */
  async clearCart({ response, auth, session }: HttpContext) {
    return this.tryOrError(
      { response, auth, session },
      async () => {
        let cart

        if (auth.isAuthenticated) {
          // Get cart for authenticated user
          const user = auth.user!
          cart = await Cart.query().where('userId', user.id).first()
        } else {
          // Get cart for guest user using session ID
          const sessionId = session.sessionId
          cart = await Cart.query().where('sessionId', sessionId).first()
        }

        if (cart) {
          // Delete all cart items
          await CartItem.query().where('cartId', cart.id).delete()

          // Update cart totals
          cart.subtotal = 0
          cart.tax = 0
          cart.shipping = 0
          cart.discount = 0
          cart.total = 0
          await cart.save()
        }

        session.flash('success', 'Cart cleared')
        return response.redirect('/store/cart')
      },
      'Failed to clear cart'
    )
  }

  /**
   * Apply coupon to cart
   */
  async applyCoupon({ request, response, auth, session }: HttpContext) {
    return this.tryOrError(
      { request, response, auth, session },
      async () => {
        // Validate input
        const couponSchema = schema.create({
          coupon_code: schema.string([
            validator.trim()
          ]),
        })

        const payload = await validator.validate({
          schema: couponSchema,
          data: request.all(),
        })

        let cart

        if (auth.isAuthenticated) {
          // Get cart for authenticated user
          const user = auth.user!
          cart = await Cart.query().where('userId', user.id).first()
        } else {
          // Get cart for guest user using session ID
          const sessionId = session.sessionId
          cart = await Cart.query().where('sessionId', sessionId).first()
        }

        if (!cart) {
          return this.notFound({ request, response, auth, session }, 'Cart not found')
        }

        // In a real app, you would validate the coupon code against a database
        // For now, we'll just apply a fixed discount
        const couponCode = payload.coupon_code.toUpperCase()
        
        if (couponCode === 'DISCOUNT10') {
          cart.couponCode = couponCode
          cart.discount = cart.subtotal * 0.1 // 10% discount
          cart.total = cart.subtotal + cart.tax + cart.shipping - cart.discount
          await cart.save()
          
          session.flash('success', 'Coupon applied successfully')
        } else {
          session.flash('error', 'Invalid coupon code')
        }

        return response.redirect('/store/cart')
      },
      'Failed to apply coupon'
    )
  }

  /**
   * Update cart totals
   */
  private async updateCartTotals(cartId: number) {
    try {
      const cart = await Cart.find(cartId)
      if (!cart) {
        return
      }

      // Get all cart items
      const cartItems = await CartItem.query().where('cartId', cartId)

      // Calculate subtotal
      let subtotal = 0
      for (const item of cartItems) {
        subtotal += item.subtotal
      }

      // Calculate tax and shipping
      const tax = subtotal * 0.1 // 10% tax (simplified)
      const shipping = cartItems.length > 0 ? 10 : 0 // Flat shipping rate (simplified)

      // Update cart
      cart.subtotal = subtotal
      cart.tax = tax
      cart.shipping = shipping
      cart.total = subtotal + tax + shipping - cart.discount
      await cart.save()
    } catch (error) {
      console.error('Error updating cart totals:', error)
    }
  }
}

