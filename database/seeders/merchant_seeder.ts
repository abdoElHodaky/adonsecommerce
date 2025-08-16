import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Merchant from '#models/Merchant'
import User from '#models/User'
import { MerchantStatus } from '#models/Merchant'
import { UserType } from '#models/User'
import { string } from '@adonisjs/core/helpers'

export default class MerchantSeeder extends BaseSeeder {
  async run() {
    // Find merchant user
    const merchantUser = await User.findBy('email', 'merchant@example.com')
    
    if (!merchantUser) {
      // Create a new merchant user if not found
      const newMerchantUser = await User.create({
        firstName: 'Merchant',
        lastName: 'User',
        email: 'merchant@example.com',
        password: 'merchant123',
        userType: UserType.MERCHANT,
        isActive: true,
      })
      
      // Create merchant store
      await Merchant.create({
        userId: newMerchantUser.id,
        storeName: 'Demo Store',
        slug: string.slugify('Demo Store'),
        description: 'This is a demo store for testing purposes.',
        contactEmail: 'contact@demostore.com',
        status: MerchantStatus.APPROVED,
        commissionRate: 10.00,
        isVerified: true,
        isActive: true,
      })
    } else {
      // Create merchant store for existing user
      await Merchant.create({
        userId: merchantUser.id,
        storeName: 'Demo Store',
        slug: string.slugify('Demo Store'),
        description: 'This is a demo store for testing purposes.',
        contactEmail: 'contact@demostore.com',
        status: MerchantStatus.APPROVED,
        commissionRate: 10.00,
        isVerified: true,
        isActive: true,
      })
    }
  }
}

