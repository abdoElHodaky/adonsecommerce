import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Category from '#models/Category'
import { string } from '@adonisjs/core/helpers'

export default class CategorySeeder extends BaseSeeder {
  async run() {
    // Create parent categories
    const electronics = await Category.create({
      name: 'Electronics',
      slug: string.slugify('Electronics'),
      description: 'Electronic devices and accessories',
      isActive: true,
      sortOrder: 1,
    })

    const clothing = await Category.create({
      name: 'Clothing',
      slug: string.slugify('Clothing'),
      description: 'Apparel and fashion items',
      isActive: true,
      sortOrder: 2,
    })

    const homeAndGarden = await Category.create({
      name: 'Home & Garden',
      slug: string.slugify('Home & Garden'),
      description: 'Home decor and garden supplies',
      isActive: true,
      sortOrder: 3,
    })

    // Create subcategories for Electronics
    await Category.createMany([
      {
        name: 'Smartphones',
        slug: string.slugify('Smartphones'),
        description: 'Mobile phones and accessories',
        parentId: electronics.id,
        isActive: true,
        sortOrder: 1,
      },
      {
        name: 'Laptops',
        slug: string.slugify('Laptops'),
        description: 'Notebook computers and accessories',
        parentId: electronics.id,
        isActive: true,
        sortOrder: 2,
      },
      {
        name: 'Audio',
        slug: string.slugify('Audio'),
        description: 'Headphones, speakers, and audio equipment',
        parentId: electronics.id,
        isActive: true,
        sortOrder: 3,
      },
    ])

    // Create subcategories for Clothing
    await Category.createMany([
      {
        name: 'Men',
        slug: string.slugify('Men'),
        description: 'Men\'s clothing and accessories',
        parentId: clothing.id,
        isActive: true,
        sortOrder: 1,
      },
      {
        name: 'Women',
        slug: string.slugify('Women'),
        description: 'Women\'s clothing and accessories',
        parentId: clothing.id,
        isActive: true,
        sortOrder: 2,
      },
      {
        name: 'Kids',
        slug: string.slugify('Kids'),
        description: 'Children\'s clothing and accessories',
        parentId: clothing.id,
        isActive: true,
        sortOrder: 3,
      },
    ])

    // Create subcategories for Home & Garden
    await Category.createMany([
      {
        name: 'Furniture',
        slug: string.slugify('Furniture'),
        description: 'Home and office furniture',
        parentId: homeAndGarden.id,
        isActive: true,
        sortOrder: 1,
      },
      {
        name: 'Kitchen',
        slug: string.slugify('Kitchen'),
        description: 'Kitchen appliances and accessories',
        parentId: homeAndGarden.id,
        isActive: true,
        sortOrder: 2,
      },
      {
        name: 'Garden',
        slug: string.slugify('Garden'),
        description: 'Garden tools and supplies',
        parentId: homeAndGarden.id,
        isActive: true,
        sortOrder: 3,
      },
    ])
  }
}

