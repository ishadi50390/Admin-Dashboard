import { DataTypes, Model } from 'sequelize';
import { randomBytes } from 'crypto';

export default function initOrder(sequelize) {
  class Order extends Model {}

  Order.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      status: {
        type: DataTypes.ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      },
      orderNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'order_number'
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id'
      },
      notes: {
        type: DataTypes.TEXT
      }
    },
    {
      sequelize,
      modelName: 'Order',
      tableName: 'orders',
      underscored: true
    }
  );

  Order.addHook('beforeValidate', (order) => {
    if (!order.orderNumber) {
      const suffix = randomBytes(3).toString('hex');
      order.orderNumber = `ORD-${Date.now()}-${suffix}`;
    }
  });

  return Order;
}
