require('dotenv').config();
const { sequelize, User, Category, Product, Order, OrderItem, Setting } = require('./models');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Sync database
    await sequelize.sync({ force: false });
    console.log('✓ Database synced');

    // Check if data already exists
    const userCount = await User.count();
    if (userCount > 0) {
      console.log('⚠ Database already has data. Skipping seed.');
      process.exit(0);
    }

    // Create users
    console.log('Creating users...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });

    const user = await User.create({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'user123',
      role: 'user'
    });

    const user2 = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'john123',
      role: 'user'
    });

    console.log('✓ Users created');

    // Create categories
    console.log('Creating categories...');
    const electronics = await Category.create({
      name: 'Electronics',
      description: 'Electronic devices and accessories'
    });

    const clothing = await Category.create({
      name: 'Clothing',
      description: 'Apparel and fashion items'
    });

    const books = await Category.create({
      name: 'Books',
      description: 'Books and reading materials'
    });

    console.log('✓ Categories created');

    // Create products
    console.log('Creating products...');
    const products = await Promise.all([
      Product.create({
        name: 'Laptop',
        description: 'High-performance laptop',
        price: 999.99,
        stock: 50,
        categoryId: electronics.id
      }),
      Product.create({
        name: 'Smartphone',
        description: 'Latest model smartphone',
        price: 699.99,
        stock: 100,
        categoryId: electronics.id
      }),
      Product.create({
        name: 'Wireless Headphones',
        description: 'Noise-cancelling headphones',
        price: 199.99,
        stock: 75,
        categoryId: electronics.id
      }),
      Product.create({
        name: 'T-Shirt',
        description: 'Cotton t-shirt',
        price: 19.99,
        stock: 200,
        categoryId: clothing.id
      }),
      Product.create({
        name: 'Jeans',
        description: 'Blue denim jeans',
        price: 49.99,
        stock: 150,
        categoryId: clothing.id
      }),
      Product.create({
        name: 'Programming Book',
        description: 'Learn modern web development',
        price: 39.99,
        stock: 80,
        categoryId: books.id
      })
    ]);

    console.log('✓ Products created');

    // Create orders
    console.log('Creating orders...');
    const order1 = await Order.create({
      userId: user.id,
      status: 'completed',
      totalAmount: 1199.98
    });

    await OrderItem.bulkCreate([
      {
        orderId: order1.id,
        productId: products[0].id, // Laptop
        quantity: 1,
        price: 999.99
      },
      {
        orderId: order1.id,
        productId: products[2].id, // Headphones
        quantity: 1,
        price: 199.99
      }
    ]);

    const order2 = await Order.create({
      userId: user2.id,
      status: 'pending',
      totalAmount: 69.98
    });

    await OrderItem.bulkCreate([
      {
        orderId: order2.id,
        productId: products[3].id, // T-Shirt
        quantity: 2,
        price: 19.99
      },
      {
        orderId: order2.id,
        productId: products[4].id, // Jeans
        quantity: 1,
        price: 49.99
      }
    ]);

    const order3 = await Order.create({
      userId: user.id,
      status: 'processing',
      totalAmount: 699.99
    });

    await OrderItem.create({
      orderId: order3.id,
      productId: products[1].id, // Smartphone
      quantity: 1,
      price: 699.99
    });

    console.log('✓ Orders created');

    // Create settings
    console.log('Creating settings...');
    await Setting.bulkCreate([
      {
        key: 'site_name',
        value: 'eCommerce Admin',
        description: 'Name of the website'
      },
      {
        key: 'admin_email',
        value: 'admin@example.com',
        description: 'Administrator email address'
      },
      {
        key: 'currency',
        value: 'USD',
        description: 'Default currency'
      },
      {
        key: 'tax_rate',
        value: '8.5',
        description: 'Tax rate percentage'
      },
      {
        key: 'enable_notifications',
        value: 'true',
        description: 'Enable email notifications'
      }
    ]);

    console.log('✓ Settings created');

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${await User.count()}`);
    console.log(`   - Categories: ${await Category.count()}`);
    console.log(`   - Products: ${await Product.count()}`);
    console.log(`   - Orders: ${await Order.count()}`);
    console.log(`   - Order Items: ${await OrderItem.count()}`);
    console.log(`   - Settings: ${await Setting.count()}`);
    console.log('\n🔑 Login credentials:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   User:  user@example.com / user123');
    console.log('   User2: john@example.com / john123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
