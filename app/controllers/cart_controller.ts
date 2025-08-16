import { HttpContext } from '@adonisjs/core/http'
import Cart from '#models/Cart'
import CartItem from '#models/CartItem'
import Product from '#models/Product'
import ProductVariant from '#models/ProductVariant'
import vine from '@vinejs/vine'
import { string } from '@vinejs/vine/rules'

export default class CartController {
  /**
   * Display the cart
   */
  async index({ view, auth, session, request }: HttpContext) {
    try {
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
    } catch (error) {
      return view.render('pages/store/cart', {
        cart: null,
      })
    }
  }

  /**
   * Add item to cart
   */
  async addToCart({ request, response, auth, session }: HttpContext) {
    // Validate input
    const cartSchema = vine.object({
      product_id: vine.number().positive(),
      variant_id: vine.number().positive().optional(),
      quantity: vine.number().positive().default(1),
      options: vine.string().optional(),
    })

    try {
      const payload = await vine.validate({
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
      
      if (product.isManageStock && payload.quantity > availableQuantity) {
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
        cartItem.quantity += payload.quantity
        cartItem.subtotal = cartItem.quantity * itemPrice
        await cartItem.save()
      } else {
        // Create new cart item
        cartItem = new CartItem()
        cartItem.cartId = cart.id
        cartItem.productId = product.id
        cartItem.productVariantId = payload.variant_id || null
        cartItem.merchantId = product.merchantId
        cartItem.quantity = payload.quantity
        cartItem.price = itemPrice
        cartItem.subtotal = payload.quantity * itemPrice
        cartItem.options = payload.options || null
        await cartItem.save()
      }

      // Update cart totals
      await this.updateCartTotals(cart.id)

      session.flash('success', 'Item added to cart')
      return response.redirect('/store/cart')
    } catch (error) {
      session.flash('error', 'Failed to add item to cart')
      return response.redirect().back()
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem({ request, response, auth, session, params }: HttpContext) {
    // Validate input
    const schema = vine.object({
      quantity: vine.number().positive(),
    })

    try {
      const payload = await vine.validate({
        schema,
        data: request.all(),
      })

      // Get cart item
      const cartItem = await CartItem.find(params.id)
      if (!cartItem) {
        session.flash('error', 'Cart item not found')
        return response.redirect().back()
      }

      // Get cart and verify ownership
      const cart = await Cart.find(cartItem.cartId)
      if (!cart) {
        session.flash('error', 'Cart not found')
        return response.redirect().back()
      }

      if (auth.isAuthenticated) {
        const user = auth.user!
        if (cart.userId !== user.id) {
          session.flash('error', 'Unauthorized')
          return response.redirect().back()
        }
      } else {
        const sessionId = session.sessionId
        if (cart.sessionId !== sessionId) {
          session.flash('error', 'Unauthorized')
          return response.redirect().back()
        }
      }

      // Check stock availability
      const product = await Product.find(cartItem.productId)
      if (!product) {
        session.flash('error', 'Product not found')
        return response.redirect().back()
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
    } catch (error) {
      session.flash('error', 'Failed to update cart')
      return response.redirect().back()
    }
  }

  /**
   * Remove item from cart
   */
  async removeCartItem({ response, auth, session, params }: HttpContext) {
    try {
      // Get cart item
      const cartItem = await CartItem.find(params.id)
      if (!cartItem) {
        session.flash('error', 'Cart item not found')
        return response.redirect().back()
      }

      // Get cart and verify ownership
      const cart = await Cart.find(cartItem.cartId)
      if (!cart) {
        session.flash('error', 'Cart not found')
        return response.redirect().back()
      }

      if (auth.isAuthenticated) {
        const user = auth.user!
        if (cart.userId !== user.id) {
          session.flash('error', 'Unauthorized')
          return response.redirect().back()
        }
      } else {
        const sessionId = session.sessionId
        if (cart.sessionId !== sessionId) {
          session.flash('error', 'Unauthorized')
          return response.redirect().back()
        }
      }

      // Delete cart item
      await cartItem.delete()

      // Update cart totals
      await this.updateCartTotals(cart.id)

      session.flash('success', 'Item removed from cart')
      return response.redirect('/store/cart')
    } catch (error) {
      session.flash('error', 'Failed to remove item from cart')
      return response.redirect().back()
    }
  }

  /**
   * Clear cart
   */
  async clearCart({ response, auth, session }: HttpContext) {
    try {
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
    } catch (error) {
      session.flash('error', 'Failed to clear cart')
      return response.redirect().back()
    }
  }

  /**
   * Apply coupon to cart
   */
  async applyCoupon({ request, response, auth, session }: HttpContext) {
    // Validate input
    const schema = vine.object({
      coupon_code: vine.string().trim(),
    })

    try {
      const payload = await vine.validate({
        schema,
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
        session.flash('error', 'Cart not found')
        return response.redirect().back()
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
    } catch (error) {
      session.flash('error', 'Failed to apply coupon')
      return response.redirect().back()
    }
  }

  /**
   * Update cart totals
   */
  private async updateCartTotals(cartId: number) {
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
  }
}

