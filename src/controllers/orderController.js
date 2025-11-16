import { Op } from 'sequelize';
import { sequelize, Order, OrderItem, Product } from '../models/index.js';

function toNumber(value) {
  return Number.parseFloat(value ?? 0);
}

export async function createOrder(req, res) {
  const { items, notes } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order must contain at least one item' });
  }

  const normalizedItems = items.map((item) => ({
    productId: item?.productId,
    quantity: Number.parseInt(item?.quantity, 10)
  }));

  if (normalizedItems.some((item) => !item.productId || Number.isNaN(item.quantity) || item.quantity <= 0)) {
    return res.status(400).json({ message: 'Each item requires a valid productId and quantity > 0' });
  }

  try {
    const productIds = normalizedItems.map((item) => item.productId);
    const products = await Product.findAll({ where: { id: { [Op.in]: productIds } } });

    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((product) => product.id));
      const missingIds = productIds.filter((id) => !foundIds.has(id));
      return res.status(400).json({ message: 'One or more products not found', missingProductIds: missingIds });
    }

    const productsById = new Map(products.map((product) => [product.id, product]));

    const itemsWithPricing = normalizedItems.map((item) => {
      const product = productsById.get(item.productId);
      const price = toNumber(product.price);

      return {
        orderId: null,
        productId: item.productId,
        quantity: item.quantity,
        price,
        lineTotal: price * item.quantity
      };
    });

    const totalAmount = itemsWithPricing.reduce((sum, item) => sum + item.lineTotal, 0);

    const result = await sequelize.transaction(async (transaction) => {
      const order = await Order.create(
        {
          userId: req.user.id,
          totalAmount,
          notes: notes || null
        },
        { transaction }
      );

      const orderItemsPayload = itemsWithPricing.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }));

      await OrderItem.bulkCreate(orderItemsPayload, { transaction });

      return order;
    });

    const createdOrder = await Order.findByPk(result.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product'
            }
          ]
        }
      ]
    });

    return res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Failed to create order:', error);
    return res.status(500).json({ message: 'Failed to create order' });
  }
}

export async function listOrders(req, res) {
  try {
    const where = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const orders = await Order.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product'
            }
          ]
        }
      ]
    });

    return res.json(orders);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return res.status(500).json({ message: 'Failed to fetch orders' });
  }
}

export async function getOrderById(req, res) {
  try {
    const where = req.user.role === 'admin'
      ? { id: req.params.id }
      : { id: req.params.id, userId: req.user.id };

    const order = await Order.findOne({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product'
            }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.json(order);
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return res.status(500).json({ message: 'Failed to fetch order' });
  }
}
