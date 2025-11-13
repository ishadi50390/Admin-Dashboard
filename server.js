require('dotenv').config();
const express = require('express');
const session = require('express-session');
const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSSequelize = require('@adminjs/sequelize');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const adminOptions = require('./admin/options');
const Dashboard = require('./admin/dashboard');
const SettingsPage = require('./admin/settings');

// Register Sequelize adapter
AdminJS.registerAdapter({
  Resource: AdminJSSequelize.Resource,
  Database: AdminJSSequelize.Database,
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Authentication routes
app.use('/api', authRoutes);

// AdminJS setup
const setupAdmin = async () => {
  const admin = new AdminJS({
    ...adminOptions,
    dashboard: Dashboard,
    pages: {
      settings: {
        handler: SettingsPage.handler,
        component: false,
        icon: 'Settings'
      }
    }
  });

  // Authentication for AdminJS
  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate: async (email, password) => {
        const { User } = require('./models');
        const user = await User.findOne({ where: { email } });
        
        if (user && await user.validatePassword(password)) {
          return {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
          };
        }
        return null;
      },
      cookiePassword: process.env.JWT_SECRET || 'your-secret-key',
    },
    null,
    {
      resave: false,
      saveUninitialized: false,
      secret: process.env.JWT_SECRET || 'your-secret-key',
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
      }
    }
  );

  app.use(admin.options.rootPath, adminRouter);

  return admin;
};

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'eCommerce Admin API',
    endpoints: {
      login: 'POST /api/login',
      logout: 'POST /api/logout',
      admin: 'GET /admin'
    }
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully.');

    // Sync database (create tables if they don't exist)
    await sequelize.sync({ alter: false });
    console.log('✓ Database synchronized successfully.');

    // Create default admin user if none exists
    const { User } = require('./models');
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✓ Default admin user created (admin@example.com / admin123)');
    }

    // Create a default regular user if none exists
    const userExists = await User.findOne({ where: { role: 'user' } });
    if (!userExists) {
      await User.create({
        name: 'Regular User',
        email: 'user@example.com',
        password: 'user123',
        role: 'user'
      });
      console.log('✓ Default regular user created (user@example.com / user123)');
    }

    // Setup AdminJS
    const admin = await setupAdmin();
    console.log('✓ AdminJS setup completed.');

    // Start server
    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📊 AdminJS is available at http://localhost:${PORT}${admin.options.rootPath}`);
      console.log('\n📝 Default credentials:');
      console.log('   Admin: admin@example.com / admin123');
      console.log('   User:  user@example.com / user123\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
