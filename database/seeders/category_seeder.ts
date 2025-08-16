import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Category from '#models/Category'

export default class CategorySeeder extends BaseSeeder {
  async run() {
    // Create parent categories
    const electronics = await Category.create({
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and gadgets',
      sortOrder: 1,
      isActive: true,
    })

    const clothing = await Category.create({
      name: 'Clothing',
      slug: 'clothing',
      description: 'Apparel and fashion items',
      sortOrder: 2,
      isActive: true,
    })

    const homeAndGarden = await Category.create({
      name: 'Home & Garden',
      slug: 'home-garden',
      description: 'Home decor and garden supplies',
      sortOrder: 3,
      isActive: true,
    })

    // Create subcategories for Electronics
    await Category.createMany([
      {
        name: 'Smartphones',
        slug: 'smartphones',
        description: 'Mobile phones and accessories',
        parentId: electronics.id,
        sortOrder: 1,
        isActive: true,
      },
      {
        name: 'Laptops',
        slug: 'laptops',
        description: 'Notebook computers and accessories',
        parentId: electronics.id,
        sortOrder: 2,
        isActive: true,
      },
      {
        name: 'Audio',
        slug: 'audio',
        description: 'Headphones, speakers, and audio equipment',
        parentId: electronics.id,
        sortOrder: 3,
        isActive: true,
      },
    ])

    // Create subcategories for Clothing
    await Category.createMany([
      {
        name: 'Men',
        slug: 'men',
        description: 'Men\'s clothing and accessories',
        parentId: clothing.id,
        sortOrder: 1,
        isActive: true,
      },
      {
        name: 'Women',
        slug: 'women',
        description: 'Women\'s clothing and accessories',
        parentId: clothing.id,
        sortOrder: 2,
        isActive: true,
      },
      {
        name: 'Kids',
        slug: 'kids',
        description: 'Children\'s clothing and accessories',
        parentId: clothing.id,
        sortOrder: 3,
        isActive: true,
      },
    ])

    // Create subcategories for Home & Garden
    await Category.createMany([
      {
        name: 'Furniture',
        slug: 'furniture',
        description: 'Home and office furniture',
        parentId: homeAndGarden.id,
        sortOrder: 1,
        isActive: true,
      },
      {
        name: 'Kitchen',
        slug: 'kitchen',
        description: 'Kitchen appliances and accessories',
        parentId: homeAndGarden.id,
        sortOrder: 2,
        isActive: true,
      },
      {
        name: 'Garden',
        slug: 'garden',
        description: 'Garden tools and supplies',
        parentId: homeAndGarden.id,
        sortOrder: 3,
        isActive: true,
      },
    ])
  }
}

