import { DataTypes, Model } from 'sequelize';

export default function initCategory(sequelize) {
  class Category extends Model {}

  Category.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.TEXT
      }
    },
    {
      sequelize,
      modelName: 'Category',
      tableName: 'categories',
      underscored: true
    }
  );

  return Category;
}
