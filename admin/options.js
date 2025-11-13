const { User, Category, Product, Order, OrderItem, Setting } = require('../models');

// Role-based access helper
const isAdmin = ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin';
const isAuthenticated = ({ currentAdmin }) => !!currentAdmin;

const adminOptions = {
  resources: [
    {
      resource: User,
      options: {
        properties: {
          password: {
            isVisible: false
          },
          role: {
            availableValues: [
              { value: 'admin', label: 'Admin' },
              { value: 'user', label: 'User' }
            ]
          }
        },
        actions: {
          list: { isAccessible: isAdmin },
          show: { isAccessible: isAuthenticated },
          edit: { isAccessible: isAdmin },
          new: { isAccessible: isAdmin },
          delete: { isAccessible: isAdmin }
        }
      }
    },
    {
      resource: Category,
      options: {
        actions: {
          list: { isAccessible: isAuthenticated },
          show: { isAccessible: isAuthenticated },
          edit: { isAccessible: isAdmin },
          new: { isAccessible: isAdmin },
          delete: { isAccessible: isAdmin }
        }
      }
    },
    {
      resource: Product,
      options: {
        properties: {
          categoryId: {
            isVisible: { list: false, filter: true, show: true, edit: true }
          }
        },
        actions: {
          list: { isAccessible: isAuthenticated },
          show: { isAccessible: isAuthenticated },
          edit: { isAccessible: isAdmin },
          new: { isAccessible: isAdmin },
          delete: { isAccessible: isAdmin }
        }
      }
    },
    {
      resource: Order,
      options: {
        properties: {
          userId: {
            isVisible: { list: false, filter: true, show: true, edit: true }
          },
          totalAmount: {
            type: 'currency',
            props: {
              currency: 'USD'
            }
          }
        },
        actions: {
          list: { isAccessible: isAuthenticated },
          show: { isAccessible: isAuthenticated },
          edit: { isAccessible: isAdmin },
          new: { isAccessible: isAdmin },
          delete: { isAccessible: isAdmin }
        }
      }
    },
    {
      resource: OrderItem,
      options: {
        properties: {
          orderId: {
            isVisible: { list: false, filter: true, show: true, edit: true }
          },
          productId: {
            isVisible: { list: false, filter: true, show: true, edit: true }
          },
          price: {
            type: 'currency',
            props: {
              currency: 'USD'
            }
          }
        },
        actions: {
          list: { isAccessible: isAuthenticated },
          show: { isAccessible: isAuthenticated },
          edit: { isAccessible: isAdmin },
          new: { isAccessible: isAdmin },
          delete: { isAccessible: isAdmin }
        }
      }
    },
    {
      resource: Setting,
      options: {
        actions: {
          list: { isAccessible: isAdmin },
          show: { isAccessible: isAdmin },
          edit: { isAccessible: isAdmin },
          new: { isAccessible: isAdmin },
          delete: { isAccessible: isAdmin }
        }
      }
    }
  ],
  rootPath: '/admin',
  branding: {
    companyName: 'eCommerce Admin',
    logo: false,
    softwareBrothers: false
  }
};

module.exports = adminOptions;
