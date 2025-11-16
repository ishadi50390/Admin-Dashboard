import sequelize from '../config/database.js';
import initUser from './user.js';
import initCategory from './category.js';
import initProduct from './product.js';
import initOrder from './order.js';
import initOrderItem from './orderItem.js';
import initSetting from './setting.js';

const User = initUser(sequelize);
const Category = initCategory(sequelize);
const Product = initProduct(sequelize);
const Order = initOrder(sequelize);
const OrderItem = initOrderItem(sequelize);
const Setting = initSetting(sequelize);

Category.hasMany(Product, {
  foreignKey: 'categoryId',
  as: 'products'
});
Product.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category'
});

User.hasMany(Order, {
  foreignKey: 'userId',
  as: 'orders'
});
Order.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  as: 'items'
});
OrderItem.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order'
});

Product.hasMany(OrderItem, {
  foreignKey: 'productId',
  as: 'orderItems'
});
OrderItem.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product'
});

export { sequelize, User, Category, Product, Order, OrderItem, Setting };
