import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/User'

export default class UserSeeder extends BaseSeeder {
  async run() {
    // Create admin user
    await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'admin123',
      userType: 'admin',
      isActive: true,
    })

    // Create merchant user
    await User.create({
      firstName: 'Merchant',
      lastName: 'User',
      email: 'merchant@example.com',
      password: 'merchant123',
      userType: 'merchant',
      isActive: true,
    })

    // Create customer user
    await User.create({
      firstName: 'Customer',
      lastName: 'User',
      email: 'customer@example.com',
      password: 'customer123',
      userType: 'customer',
      isActive: true,
    })
  }
}

