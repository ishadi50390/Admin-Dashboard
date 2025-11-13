const { User, Order, Product, Category } = require('../models');

const getDashboardStats = async (currentAdmin) => {
  try {
    if (currentAdmin.role === 'admin') {
      // Admin Dashboard
      const totalUsers = await User.count();
      const totalOrders = await Order.count();
      const totalProducts = await Product.count();
      const totalCategories = await Category.count();
      
      const totalRevenue = await Order.sum('totalAmount');
      
      const pendingOrders = await Order.count({ where: { status: 'pending' } });
      const completedOrders = await Order.count({ where: { status: 'completed' } });

      return {
        totalUsers,
        totalOrders,
        totalProducts,
        totalCategories,
        totalRevenue: totalRevenue || 0,
        pendingOrders,
        completedOrders
      };
    } else {
      // Regular User Dashboard
      const userOrders = await Order.count({ where: { userId: currentAdmin.id } });
      const userTotalSpent = await Order.sum('totalAmount', { where: { userId: currentAdmin.id } });

      return {
        userOrders,
        userTotalSpent: userTotalSpent || 0
      };
    }
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return null;
  }
};

const Dashboard = {
  handler: async (request, response, context) => {
    const { currentAdmin } = context;
    const stats = await getDashboardStats(currentAdmin);

    if (currentAdmin.role === 'admin') {
      return {
        html: `
          <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h1 style="color: #333; margin-bottom: 30px;">Admin Dashboard</h1>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 10px; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 10px 0; font-size: 16px; opacity: 0.9;">Total Users</h3>
                <p style="margin: 0; font-size: 36px; font-weight: bold;">${stats.totalUsers}</p>
              </div>
              
              <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 25px; border-radius: 10px; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 10px 0; font-size: 16px; opacity: 0.9;">Total Orders</h3>
                <p style="margin: 0; font-size: 36px; font-weight: bold;">${stats.totalOrders}</p>
              </div>
              
              <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 25px; border-radius: 10px; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 10px 0; font-size: 16px; opacity: 0.9;">Total Products</h3>
                <p style="margin: 0; font-size: 36px; font-weight: bold;">${stats.totalProducts}</p>
              </div>
              
              <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 25px; border-radius: 10px; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 10px 0; font-size: 16px; opacity: 0.9;">Total Revenue</h3>
                <p style="margin: 0; font-size: 36px; font-weight: bold;">$${parseFloat(stats.totalRevenue).toFixed(2)}</p>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
              <div style="background: white; padding: 25px; border-radius: 10px; border: 1px solid #e0e0e0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #666;">Total Categories</h3>
                <p style="margin: 0; font-size: 32px; font-weight: bold; color: #333;">${stats.totalCategories}</p>
              </div>
              
              <div style="background: white; padding: 25px; border-radius: 10px; border: 1px solid #e0e0e0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #666;">Pending Orders</h3>
                <p style="margin: 0; font-size: 32px; font-weight: bold; color: #ff9800;">${stats.pendingOrders}</p>
              </div>
              
              <div style="background: white; padding: 25px; border-radius: 10px; border: 1px solid #e0e0e0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #666;">Completed Orders</h3>
                <p style="margin: 0; font-size: 32px; font-weight: bold; color: #4caf50;">${stats.completedOrders}</p>
              </div>
            </div>

            <div style="margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 10px;">
              <h3 style="margin: 0 0 15px 0; color: #333;">Quick Actions</h3>
              <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <a href="/admin/resources/User" style="padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: 500;">Manage Users</a>
                <a href="/admin/resources/Order" style="padding: 10px 20px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; font-weight: 500;">View Orders</a>
                <a href="/admin/resources/Product" style="padding: 10px 20px; background: #4facfe; color: white; text-decoration: none; border-radius: 5px; font-weight: 500;">Manage Products</a>
                <a href="/admin/pages/settings" style="padding: 10px 20px; background: #43e97b; color: white; text-decoration: none; border-radius: 5px; font-weight: 500;">Settings</a>
              </div>
            </div>
          </div>
        `
      };
    } else {
      // Regular User Dashboard
      return {
        html: `
          <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h1 style="color: #333; margin-bottom: 30px;">My Dashboard</h1>
            
            <div style="background: white; padding: 25px; border-radius: 10px; border: 1px solid #e0e0e0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 20px;">
              <h2 style="margin: 0 0 15px 0; color: #333;">Welcome, ${currentAdmin.name}!</h2>
              <p style="color: #666; margin: 0;">Email: ${currentAdmin.email}</p>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 10px; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 10px 0; font-size: 16px; opacity: 0.9;">My Orders</h3>
                <p style="margin: 0; font-size: 36px; font-weight: bold;">${stats.userOrders}</p>
              </div>
              
              <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 25px; border-radius: 10px; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 10px 0; font-size: 16px; opacity: 0.9;">Total Spent</h3>
                <p style="margin: 0; font-size: 36px; font-weight: bold;">$${parseFloat(stats.userTotalSpent).toFixed(2)}</p>
              </div>
            </div>

            <div style="margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 10px;">
              <h3 style="margin: 0 0 15px 0; color: #333;">Quick Actions</h3>
              <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <a href="/admin/resources/Order" style="padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: 500;">View My Orders</a>
                <a href="/admin/resources/Product" style="padding: 10px 20px; background: #4facfe; color: white; text-decoration: none; border-radius: 5px; font-weight: 500;">Browse Products</a>
              </div>
            </div>
          </div>
        `
      };
    }
  }
};

module.exports = Dashboard;
