import dotenv from 'dotenv';
import { sequelize, Order, OrderItem, User } from '../src/models/index.js';

dotenv.config();

async function main() {
  try {
    await sequelize.authenticate();
    const orders = await Order.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'role'] },
        { model: OrderItem, as: 'items', attributes: ['id', 'quantity', 'price'] }
      ]
    });

    console.log(`Orders count: ${orders.length}`);
    for (const order of orders) {
      console.log({
        id: order.id,
        userId: order.userId,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        user: order.user?.email,
        items: order.items?.map((item) => ({ id: item.id, quantity: item.quantity, price: item.price }))
      });
    }

    const adminMetrics = await Order.count();
    const adminRevenue = await Order.sum('totalAmount');
    console.log(`Order.count(): ${adminMetrics}`);
    console.log(`Order.sum(totalAmount): ${adminRevenue}`);

    await sequelize.close();
  } catch (error) {
    console.error('Inspection failed:', error);
    await sequelize.close();
    process.exit(1);
  }
}

main();
