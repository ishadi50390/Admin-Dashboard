import { DataTypes, Model } from 'sequelize';

export default function initOrderItem(sequelize) {
  class OrderItem extends Model {}

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

  return OrderItem;
}
