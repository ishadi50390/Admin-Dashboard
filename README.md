# Admin-Dashboard

Role-Based eCommerce Admin Dashboard with AdminJS, Sequelize, and PostgreSQL

## Overview

A secure admin panel for a basic eCommerce backend featuring:
- Authentication with JWT
- Role-based access control (Admin & User roles)
- Custom dashboards for different user roles
- PostgreSQL database with Sequelize ORM
- AdminJS for the admin interface

## Features

### Core Functionality
- **Node.js + Express** backend
- **Sequelize ORM** with PostgreSQL
- **AdminJS** for admin interface
- **bcrypt** for password hashing
- **JWT-based authentication**

### Database Models
- **User** - User accounts with roles
- **Category** - Product categories
- **Product** - Products with category relationships
- **Order** - Customer orders
- **OrderItem** - Line items in orders
- **Setting** - Key-value configuration storage

### Role-Based Access Control

#### Admin Users
- Full access to all resources (Users, Orders, Products, Categories, Settings)
- Can add/edit/delete all entities
- Custom Admin Dashboard showing:
  - Total users, orders, products, and categories
  - Total revenue
  - Pending and completed orders

#### Regular Users
- Limited access (cannot view Users or Settings)
- Can view their own orders and browse products
- Custom User Dashboard showing:
  - Number of orders
  - Total amount spent

### Custom Pages
- **Dashboard** - Role-specific summary information
- **Settings** - Admin-only configuration management

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Admin-Dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb ecommerce_admin
   
   # Or using psql
   psql -U postgres
   CREATE DATABASE ecommerce_admin;
   ```

4. **Configure environment variables**
   
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=ecommerce_admin
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret_key
   PORT=3000
   NODE_ENV=development
   ```

5. **Start the server**
   ```bash
   npm start
   ```

The server will automatically:
- Create database tables
- Create default admin user: `admin@example.com` / `admin123`
- Create default regular user: `user@example.com` / `user123`

6. **(Optional) Seed the database with sample data**
   ```bash
   npm run seed
   ```
   
   This will populate the database with:
   - 3 users (1 admin, 2 regular users)
   - 3 product categories
   - 6 sample products
   - 3 sample orders with items
   - 5 configuration settings

## Usage

### Accessing the Application

- **API Root**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

### Default Credentials

**Admin Account:**
- Email: `admin@example.com`
- Password: `admin123`

**Regular User Account:**
- Email: `user@example.com`
- Password: `user123`

### API Endpoints

#### Authentication

**Login**
```bash
POST /api/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

Response:
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Logout**
```bash
POST /api/logout
```

### AdminJS Interface

1. Navigate to http://localhost:3000/admin
2. Login with admin or user credentials
3. Admins see all resources and custom admin dashboard
4. Regular users see limited resources and personal dashboard

## Project Structure

```
Admin-Dashboard/
├── models/              # Sequelize models
│   ├── User.js
│   ├── Category.js
│   ├── Product.js
│   ├── Order.js
│   ├── OrderItem.js
│   ├── Setting.js
│   └── index.js        # Model associations
├── config/
│   └── database.js     # Database configuration
├── middleware/
│   └── auth.js         # Authentication middleware
├── routes/
│   └── auth.js         # Authentication routes
├── admin/
│   ├── options.js      # AdminJS configuration
│   ├── dashboard.js    # Custom dashboard
│   └── settings.js     # Settings page
├── server.js           # Main application file
├── .env                # Environment variables
├── .env.example        # Example environment variables
├── package.json
└── README.md
```

## Security Features

- Password hashing with bcrypt (automatically applied)
- JWT token-based authentication
- Password field hidden in all AdminJS views
- Role-based access control for all resources
- Session management with express-session

## Database Schema

### Users
- id, name, email, password (hashed), role (admin/user)

### Categories
- id, name, description

### Products
- id, name, description, price, stock, categoryId

### Orders
- id, userId, status (pending/processing/completed/cancelled), totalAmount

### OrderItems
- id, orderId, productId, quantity, price

### Settings
- id, key, value, description

## Customization

### Adding New Resources
1. Create a new model in `models/`
2. Add associations in `models/index.js`
3. Add resource configuration in `admin/options.js`

### Customizing Dashboards
- Edit `admin/dashboard.js` for dashboard content
- Add new custom pages in `admin/` directory

### Modifying Access Control
- Update `isAccessible` and `isVisible` in `admin/options.js`

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check if database exists: `psql -l`

### Port Already in Use
- Change PORT in `.env` file
- Or kill the process using port 3000

### Module Not Found Errors
- Run `npm install` again
- Delete `node_modules` and reinstall

## Documentation

- **[README.md](README.md)** - This file (overview and quick start)
- **[FEATURES.md](FEATURES.md)** - Detailed feature documentation
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Step-by-step setup instructions
- **[SECURITY.md](SECURITY.md)** - Security documentation and best practices

## Security

This application implements multiple security measures including:
- Bcrypt password hashing
- JWT authentication
- Role-based access control
- HttpOnly, Secure, and SameSite cookies
- Input validation
- SQL injection prevention

For detailed security information, production hardening guide, and security checklist, see [SECURITY.md](SECURITY.md).

## License

ISC
