# Features Documentation

## Role-Based Access Control (RBAC)

This application implements comprehensive role-based access control with two distinct user roles:

### Admin Role

**Full System Access:**
- View, create, edit, and delete all resources
- Access to all database tables through AdminJS
- Complete CRUD operations on Users, Products, Categories, Orders, OrderItems, and Settings

**Admin Dashboard Features:**
- Total Users count
- Total Orders count
- Total Products count
- Total Categories count
- Total Revenue calculation
- Pending Orders count
- Completed Orders count
- Quick action buttons for common tasks

**Exclusive Access:**
- Users management (create, edit, delete users)
- Settings management (system configuration)
- Full order management capabilities

### Regular User Role

**Limited Access:**
- View products and categories (read-only for create/edit/delete)
- View their own orders and order details
- Browse available products

**User Dashboard Features:**
- Personal order count
- Total amount spent
- Quick access to personal orders
- Product browsing

**Restricted Access:**
- Cannot view or manage other users
- Cannot access Settings
- Cannot create, edit, or delete products/categories
- Cannot modify orders

## Authentication System

### Password Security
- **Bcrypt Hashing:** All passwords are automatically hashed using bcrypt with salt rounds of 10
- **Hash on Create:** Passwords are hashed when user accounts are created
- **Hash on Update:** Password changes are automatically re-hashed
- **Validation Method:** Custom `validatePassword()` method for secure password verification

### JWT Authentication
- **Token Generation:** JWT tokens are created upon successful login
- **Token Expiration:** Tokens expire after 24 hours
- **Session Storage:** Tokens stored in session for AdminJS integration
- **Secure Headers:** Authorization header support for API calls

### Authentication Endpoints

#### POST /api/login
```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "token": "jwt.token.here",
  "user": {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com",
    "role": "user"
  }
}
```

#### POST /api/logout
Destroys the current session and logs out the user.

## Database Models

### User Model
**Fields:**
- `id` (Primary Key, Auto-increment)
- `name` (String, Required)
- `email` (String, Required, Unique, Email format)
- `password` (String, Required, Auto-hashed)
- `role` (Enum: 'admin' or 'user', Default: 'user')
- `createdAt`, `updatedAt` (Timestamps)

**Methods:**
- `validatePassword(password)` - Validates password against hash

**Security:**
- Password field hidden in all AdminJS views
- Automatic password hashing via Sequelize hooks

### Category Model
**Fields:**
- `id` (Primary Key)
- `name` (String, Required, Unique)
- `description` (Text, Optional)

**Relationships:**
- Has many Products

### Product Model
**Fields:**
- `id` (Primary Key)
- `name` (String, Required)
- `description` (Text, Optional)
- `price` (Decimal(10,2), Required, Min: 0)
- `stock` (Integer, Required, Default: 0, Min: 0)
- `categoryId` (Foreign Key to Category)

**Relationships:**
- Belongs to Category
- Has many OrderItems

### Order Model
**Fields:**
- `id` (Primary Key)
- `userId` (Foreign Key to User)
- `status` (Enum: 'pending', 'processing', 'completed', 'cancelled')
- `totalAmount` (Decimal(10,2), Required, Min: 0)

**Relationships:**
- Belongs to User
- Has many OrderItems

### OrderItem Model
**Fields:**
- `id` (Primary Key)
- `orderId` (Foreign Key to Order)
- `productId` (Foreign Key to Product)
- `quantity` (Integer, Required, Min: 1)
- `price` (Decimal(10,2), Required, Min: 0)

**Relationships:**
- Belongs to Order
- Belongs to Product

### Setting Model
**Fields:**
- `id` (Primary Key)
- `key` (String, Required, Unique)
- `value` (Text, Optional)
- `description` (Text, Optional)

**Purpose:**
- Store application configuration
- Key-value pairs for system settings
- Admin-only access

## Custom Pages

### Admin Dashboard (`/admin`)
A visually appealing dashboard showing:
- System statistics in colorful gradient cards
- Quick action buttons for common tasks
- Real-time data from the database
- Revenue and order status tracking

**Visible to:** Admin users only

### User Dashboard (`/admin`)
A personalized dashboard showing:
- User profile information
- Personal order statistics
- Total spending
- Quick access to orders and products

**Visible to:** Regular users

### Settings Page (`/admin/pages/settings`)
A configuration management interface:
- List all system settings
- Edit existing settings
- Add new settings
- Settings displayed in a clean table format

**Visible to:** Admin users only

## AdminJS Configuration

### Resource Visibility
Each resource has customized visibility rules:

```javascript
isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin'
isAccessible: ({ currentAdmin }) => !!currentAdmin
```

### Action Permissions
- `list` - View list of records
- `show` - View single record details
- `edit` - Edit existing records
- `new` - Create new records
- `delete` - Delete records

### Property Customization
- Password fields hidden in all views
- Foreign keys hidden in list views but shown in filters
- Currency formatting for price fields
- Enum values with human-readable labels

## Security Features

1. **Password Hashing:** Automatic bcrypt hashing with hooks
2. **Hidden Passwords:** Password field never displayed in UI
3. **JWT Tokens:** Secure token-based authentication
4. **Session Management:** Express-session for state management
5. **Role Validation:** Server-side role checks for all operations
6. **Input Validation:** Sequelize validators on all fields
7. **SQL Injection Prevention:** Parameterized queries via Sequelize

## API Integration

### Using JWT Token
```javascript
// Include token in Authorization header
fetch('http://localhost:3000/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Session-Based (AdminJS)
AdminJS uses session-based authentication automatically after login through the UI.

## Customization Guide

### Adding a New Role
1. Update User model enum in `models/User.js`
2. Create role-check helper in `admin/options.js`
3. Apply to resource actions and visibility
4. Create custom dashboard for the role in `admin/dashboard.js`

### Adding a New Resource
1. Create Sequelize model in `models/`
2. Add associations in `models/index.js`
3. Add to AdminJS resources in `admin/options.js`
4. Configure visibility and actions
5. Customize properties as needed

### Creating Custom Pages
1. Create handler in `admin/` directory
2. Add to AdminJS pages configuration in `server.js`
3. Implement HTML response with inline styles
4. Add role-based access control

## Testing

### Authentication Tests
Run the authentication test suite:
```bash
node test-auth.js
```

Tests verify:
- User creation
- Password hashing
- Password validation
- Password updates
- Hash uniqueness

### Manual Testing Checklist

**Admin User Testing:**
- [ ] Login with admin credentials
- [ ] View all resources
- [ ] Create new user
- [ ] Edit products
- [ ] Delete categories
- [ ] Access settings page
- [ ] View admin dashboard

**Regular User Testing:**
- [ ] Login with user credentials
- [ ] Verify cannot see Users table
- [ ] Verify cannot see Settings
- [ ] View personal orders
- [ ] Browse products (read-only)
- [ ] View user dashboard

**Security Testing:**
- [ ] Verify passwords are hashed in database
- [ ] Test invalid login attempts
- [ ] Verify JWT token expiration
- [ ] Test role-based restrictions
- [ ] Verify logout functionality

## Performance Considerations

1. **Database Pooling:** Connection pool configured (max: 5, min: 0)
2. **Logging Disabled:** Sequelize logging disabled in production
3. **Session Store:** Consider Redis for production sessions
4. **Indexes:** Add indexes on frequently queried fields
5. **Pagination:** AdminJS provides automatic pagination

## Production Deployment

### Environment Variables
Ensure all environment variables are properly set:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET` (use strong random value)
- `NODE_ENV=production`
- `PORT`

### Security Checklist
- [ ] Change default admin password
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Set secure cookie flags
- [ ] Implement rate limiting
- [ ] Add CORS configuration
- [ ] Use environment-specific settings
- [ ] Regular security audits

### Database
- [ ] Use managed PostgreSQL service
- [ ] Set up regular backups
- [ ] Configure connection pooling
- [ ] Implement monitoring
- [ ] Use SSL for database connections

## Troubleshooting

### Common Issues

**"Database connection failed"**
- Check PostgreSQL is running
- Verify credentials in .env
- Ensure database exists

**"Cannot read property 'role' of undefined"**
- User not properly authenticated
- Session might have expired
- Check JWT token validity

**"Password validation always fails"**
- Ensure password is being hashed
- Check bcrypt version compatibility
- Verify model hooks are running

**"AdminJS resources not showing"**
- Check user role permissions
- Verify isAccessible functions
- Ensure user is logged in

## Additional Resources

- [AdminJS Documentation](https://docs.adminjs.co/)
- [Sequelize Documentation](https://sequelize.org/)
- [Express.js Guide](https://expressjs.com/)
- [JWT Introduction](https://jwt.io/)
- [Bcrypt Documentation](https://www.npmjs.com/package/bcrypt)
