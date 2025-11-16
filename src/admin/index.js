import { Router } from 'express';
import AdminJS, { ValidationError } from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import AdminJSSequelize from '@adminjs/sequelize';
import componentLoader from './componentLoader.js';
import {
  sequelize,
  User,
  Category,
  Product,
  Order,
  OrderItem,
  Setting
} from '../models/index.js';

AdminJS.registerAdapter(AdminJSSequelize);

const isAdmin = ({ currentAdmin }) => currentAdmin?.role === 'admin';
const isAuthenticated = ({ currentAdmin }) => Boolean(currentAdmin);

const fetchOrderIdsForUser = async (userId) => {
  if (!userId) {
    return [];
  }

  const orders = await Order.findAll({
    where: { userId },
    attributes: ['id'],
    raw: true
  });

  return orders.map((order) => order.id);
};

const ownsOrder = async (userId, orderId) => {
  if (!userId || !orderId) {
    return false;
  }

  const order = await Order.findByPk(orderId, {
    attributes: ['id', 'userId'],
    raw: true
  });

  return order?.user_id === userId;
};

const ownsOrderItem = async (userId, orderItemId) => {
  if (!userId || !orderItemId) {
    return false;
  }

  const orderItem = await OrderItem.findByPk(orderItemId, {
    attributes: ['id', 'orderId'],
    include: [
      {
        model: Order,
        as: 'order',
        attributes: ['userId']
      }
    ]
  });

  return Boolean(orderItem) && orderItem.order?.userId === userId;
};

const setPasswordField = async (request) => {
  if (!request.payload) {
    return request;
  }

  if (request.payload.setPassword) {
    if (!request.payload.setPassword.trim()) {
        throw new ValidationError({
        setPassword: {
          message: 'Password cannot be empty'
        }
      });
    }

    request.payload = {
      ...request.payload,
      password: request.payload.setPassword
    };
  }

  if (request.payload.setPassword === '') {
    delete request.payload.setPassword;
  }

  if (request.payload.setPassword !== undefined) {
    delete request.payload.setPassword;
  }

  return request;
};

const adminJs = new AdminJS({
  rootPath: '/admin',
  componentLoader,
  branding: {
    companyName: 'eCommerce Control Center',
    withMadeWithLove: false
  },
  dashboard: {
    handler: async (request, response, context) => {
      if (!context.currentAdmin) {
        return {};
      }

      const isCurrentAdmin = context.currentAdmin.role === 'admin';

      const [totalUsers, totalOrders, totalProducts, revenueRows, recentOrdersRows] = await Promise.all([
        isCurrentAdmin ? User.count() : Promise.resolve(null),
        isCurrentAdmin ? Order.count() : Order.count({ where: { userId: context.currentAdmin.id } }),
        Product.count(),
        Order.sum('totalAmount', {
          where: isCurrentAdmin ? {} : { userId: context.currentAdmin.id }
        }),
        Order.findAll({
          where: isCurrentAdmin ? {} : { userId: context.currentAdmin.id },
          include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
          order: [['createdAt', 'DESC']],
          limit: 5
        })
      ]);

      const recentOrders = recentOrdersRows.map((order) => ({
        id: order.id,
        reference: order.id.slice(0, 8),
        status: order.status,
        totalAmount: Number(order.totalAmount || 0),
        customer: order.user ? order.user.name || order.user.email : 'Unknown'
      }));

      return {
        summary: {
          totalUsers,
          totalOrders,
          totalProducts,
          totalRevenue: Number(revenueRows || 0)
        },
        recentOrders,
        currentAdmin: {
          id: context.currentAdmin.id,
          email: context.currentAdmin.email,
          name: context.currentAdmin.name,
          role: context.currentAdmin.role
        }
      };
    },
    component: componentLoader.add('Dashboard', './components/Dashboard.jsx')
  },
  pages: {
    settings: {
      label: 'Settings',
      handler: async (request, response, context) => {
        if (!isAdmin(context)) {
          return {
            notice: {
              message: 'You are not authorized to access settings',
              type: 'error'
            }
          };
        }

        if (request.method === 'post') {
          const { key, value } = request.payload;
          if (!key || !value) {
            return {
              notice: {
                message: 'Key and value are required',
                type: 'error'
              }
            };
          }

          const [setting] = await Setting.findOrCreate({
            where: { key },
            defaults: { value }
          });

          if (setting.value !== value) {
            setting.value = value;
            await setting.save();
          }

          return {
            updated: true
          };
        }

        const settings = await Setting.findAll({ order: [['key', 'ASC']] });
        return {
          settings: settings.map((setting) => ({
            id: setting.id,
            key: setting.key,
            value: setting.value
          }))
        };
      },
      component: componentLoader.add('SettingsPage', './components/SettingsPage.jsx')
    }
  },
  resources: [
    {
      resource: User,
      options: {
        navigation: {
          name: 'Management'
        },
        properties: {
          password: {
            isVisible: false
          },
          setPassword: {
            type: 'password',
            isVisible: {
              list: false,
              filter: false,
              show: false,
              edit: true,
              new: true
            }
          }
        },
        actions: {
          list: { isAccessible: isAdmin },
          show: { isAccessible: isAdmin },
          new: {
            isAccessible: isAdmin,
            before: setPasswordField
          },
          edit: {
            isAccessible: isAdmin,
            before: setPasswordField
          },
          delete: { isAccessible: isAdmin }
        },
        isVisible: isAdmin
      }
    },
    {
      resource: Category,
      options: {
        navigation: {
          name: 'Catalog'
        },
        actions: {
          new: { isAccessible: isAdmin },
          edit: { isAccessible: isAdmin },
          delete: { isAccessible: isAdmin }
        }
      }
    },
    {
      resource: Product,
      options: {
        navigation: {
          name: 'Catalog'
        },
        properties: {
          categoryId: {
            isVisible: { list: false, filter: true, show: true, edit: true }
          }
        },
        actions: {
          new: { isAccessible: isAdmin },
          edit: { isAccessible: isAdmin },
          delete: { isAccessible: isAdmin }
        }
      }
    },
    {
      resource: Order,
      options: {
        navigation: {
          name: 'Orders'
        },
        properties: {
          orderNumber: {
            isVisible: { list: true, filter: true, show: true, edit: false, new: false }
          },
          userId: {
            isVisible: { list: false, filter: true, show: true, edit: true, new: true }
          }
        },
        actions: {
          list: {
            isAccessible: isAuthenticated,
            before: async (request, context) => {
              if (!isAdmin(context)) {
                request.query = request.query || {};
                request.query.filters = {
                  ...(request.query.filters || {}),
                  userId: context.currentAdmin.id
                };
              }
              return request;
            }
          },
          show: {
            isAccessible: isAuthenticated,
            after: async (response, request, context) => {
              if (isAdmin(context) || !response.record) {
                return response;
              }

              if (response.record.params.userId !== context.currentAdmin.id) {
                return {
                  ...response,
                  notice: {
                    message: 'You are not authorized to view this order',
                    type: 'error'
                  }
                };
              }

              return response;
            }
          },
          new: {
            isAccessible: isAuthenticated,
            before: async (request, context) => {
              if (!request.payload) {
                return request;
              }

              if (!isAdmin(context)) {
                request.payload = {
                  ...request.payload,
                  userId: context.currentAdmin.id,
                  status: request.payload.status || 'pending'
                };
              }

              return request;
            }
          },
          edit: {
            isAccessible: isAuthenticated,
            before: async (request, context) => {
              if (isAdmin(context)) {
                return request;
              }

              const orderId = request.params?.recordId;
              const authorized = await ownsOrder(context.currentAdmin.id, orderId);

              if (!authorized) {
                  throw new ValidationError({
                  _error: 'You are not authorized to update this order'
                });
              }

              if (request.payload) {
                request.payload = {
                  ...request.payload,
                  userId: context.currentAdmin.id
                };
              }

              return request;
            }
          },
          delete: {
            isAccessible: isAuthenticated,
            before: async (request, context) => {
              if (isAdmin(context)) {
                return request;
              }

              const orderId = request.params?.recordId;
              const authorized = await ownsOrder(context.currentAdmin.id, orderId);

              if (!authorized) {
                  throw new ValidationError({
                  _error: 'You are not authorized to delete this order'
                });
              }

              return request;
            }
          }
        }
      }
    },
    {
      resource: OrderItem,
      options: {
        navigation: {
          name: 'Orders'
        },
        actions: {
          list: {
            isAccessible: isAuthenticated,
            after: async (response, request, context) => {
              if (isAdmin(context) || !response?.records?.length) {
                return response;
              }

              const allowedOrderIds = new Set(await fetchOrderIdsForUser(context.currentAdmin.id));
              const filteredRecords = response.records.filter((record) =>
                allowedOrderIds.has(record.params.orderId)
              );

              return {
                ...response,
                records: filteredRecords,
                meta: {
                  ...response.meta,
                  total: filteredRecords.length
                }
              };
            }
          },
          show: {
            isAccessible: isAuthenticated,
            after: async (response, request, context) => {
              if (isAdmin(context) || !response.record) {
                return response;
              }

              const allowedOrderIds = new Set(await fetchOrderIdsForUser(context.currentAdmin.id));

              if (!allowedOrderIds.has(response.record.params.orderId)) {
                return {
                  ...response,
                  notice: {
                    message: 'You are not authorized to view this order item',
                    type: 'error'
                  },
                  record: null
                };
              }

              return response;
            }
          },
          new: {
            isAccessible: isAuthenticated,
            before: async (request, context) => {
              if (isAdmin(context) || !request.payload) {
                return request;
              }

              const allowedOrderIds = new Set(await fetchOrderIdsForUser(context.currentAdmin.id));
              const { orderId } = request.payload;

              if (!orderId || !allowedOrderIds.has(orderId)) {
                  throw new ValidationError({
                  orderId: {
                    message: 'You can only add items to your own orders'
                  }
                });
              }

              return request;
            }
          },
          edit: {
            isAccessible: isAuthenticated,
            before: async (request, context) => {
              if (isAdmin(context)) {
                return request;
              }

              const itemId = request.params?.recordId;
              const authorized = await ownsOrderItem(context.currentAdmin.id, itemId);

              if (!authorized) {
                  throw new ValidationError({
                  _error: 'You are not authorized to update this order item'
                });
              }

              if (request.payload) {
                const orderItem = await OrderItem.findByPk(itemId, {
                  attributes: ['orderId']
                });

                if (orderItem) {
                  request.payload = {
                    ...request.payload,
                    orderId: orderItem.orderId
                  };
                }
              }

              return request;
            }
          },
          delete: {
            isAccessible: isAuthenticated,
            before: async (request, context) => {
              if (isAdmin(context)) {
                return request;
              }

              const itemId = request.params?.recordId;
              const authorized = await ownsOrderItem(context.currentAdmin.id, itemId);

              if (!authorized) {
                  throw new ValidationError({
                  _error: 'You are not authorized to delete this order item'
                });
              }

              return request;
            }
          }
        }
      }
    },
    {
      resource: Setting,
      options: {
        navigation: {
          name: 'Management'
        },
        isVisible: isAdmin,
        actions: {
          list: { isAccessible: isAdmin },
          show: { isAccessible: isAdmin },
          new: { isAccessible: isAdmin },
          edit: { isAccessible: isAdmin },
          delete: { isAccessible: isAdmin }
        }
      }
    }
  ]
});

export function buildAdminRouter(authenticate) {
  const router = Router();

  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    adminJs,
    {
      authenticate,
      cookieName: 'adminjs-token',
      cookiePassword: process.env.SESSION_SECRET || 'sessionsecret'
    },
    null,
    {
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || 'sessionsecret'
    }
  );

  router.use(adminRouter);

  return router;
}

export default adminJs;
