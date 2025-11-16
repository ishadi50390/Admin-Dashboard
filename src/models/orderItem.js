import { DataTypes, Model } from 'sequelize';

export default function initOrderItem(sequelize) {
  class OrderItem extends Model {}

  async function updateOrderTotal(orderId, transaction) {
    if (!orderId) {
      return;
    }

    const items = await OrderItem.findAll({
      where: { orderId },
      attributes: ['quantity', 'unit_price'],
      transaction
    });

    const totalAmount = items.reduce((sum, item) => {
      const price = Number.parseFloat(item.price);
      return sum + (Number.isNaN(price) ? 0 : price * item.quantity);
    }, 0);

    await sequelize.models.Order.update(
      { totalAmount },
      { where: { id: orderId }, transaction }
    );
  }

  OrderItem.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        }
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        },
        field: 'unit_price'
      },
      orderId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'order_id'
      },
      productId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'product_id'
      }
    },
    {
      sequelize,
      modelName: 'OrderItem',
      tableName: 'order_items',
      underscored: true
    }
  );

  OrderItem.addHook('afterCreate', async (orderItem, options) => {
    await updateOrderTotal(orderItem.orderId, options?.transaction);
  });

  OrderItem.addHook('afterUpdate', async (orderItem, options) => {
    await updateOrderTotal(orderItem.orderId, options?.transaction);
  });

  OrderItem.addHook('afterDestroy', async (orderItem, options) => {
    await updateOrderTotal(orderItem.orderId, options?.transaction);
  });

  return OrderItem;
}
