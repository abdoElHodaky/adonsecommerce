import { BaseSeeder } from '@adonisjs/lucid/seeders'
import UserSeeder from './user_seeder.js'
import MerchantSeeder from './merchant_seeder.js'
import CategorySeeder from './category_seeder.js'

export default class MainSeeder extends BaseSeeder {
  async run() {
    await new UserSeeder().run()
    await new MerchantSeeder().run()
    await new CategorySeeder().run()
  }
}

