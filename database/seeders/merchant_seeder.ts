import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Merchant from '#models/Merchant'
import User from '#models/User'

export default class MerchantSeeder extends BaseSeeder {
  async run() {
    // Get merchant user
    const merchantUser = await User.findBy('email', 'merchant@example.com')
    
    if (merchantUser) {
      // Create merchant profile
      await Merchant.create({
        userId: merchantUser.id,
        storeName: 'Demo Store',
        slug: 'demo-store',
        description: 'This is a demo store for testing purposes.',
        contactEmail: 'merchant@example.com',
        status: 'approved',
        commissionRate: 10,
        isVerified: true,
        isActive: true,
      })
    }
  }
}

