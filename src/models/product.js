import { DataTypes, Model } from 'sequelize';

export default function initProduct(sequelize) {
  class Product extends Model {}

  Product.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      categoryId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'category_id'
      }
    },
    {
      sequelize,
      modelName: 'Product',
      tableName: 'products',
      underscored: true
    }
  );

  return Product;
}
