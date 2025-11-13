# Quick Setup Guide

This guide will help you get the eCommerce Admin Dashboard up and running quickly.

## Prerequisites Check

Before starting, make sure you have:
- ✅ Node.js (v14+) installed: `node --version`
- ✅ npm installed: `npm --version`
- ✅ PostgreSQL (v12+) installed: `psql --version`

## Step-by-Step Setup

### 1. Install Node.js (if needed)
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS (using Homebrew)
brew install node

# Windows
# Download from https://nodejs.org/
```

### 2. Install PostgreSQL (if needed)
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# macOS (using Homebrew)
brew install postgresql
brew services start postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### 3. Set Up PostgreSQL Database
```bash
# Start PostgreSQL (if not already running)
sudo service postgresql start  # Linux
brew services start postgresql # macOS

# Create database
sudo -u postgres createdb ecommerce_admin

# Or use psql directly
sudo -u postgres psql
# In psql prompt:
CREATE DATABASE ecommerce_admin;
\q
```

### 4. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd Admin-Dashboard

# Install dependencies
npm install
```

### 5. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
nano .env  # or use any text editor
```

Update these values in `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce_admin
DB_USER=postgres              # Your PostgreSQL username
DB_PASSWORD=your_password     # Your PostgreSQL password
JWT_SECRET=your_random_secret # Generate a random string
PORT=3000
NODE_ENV=development
```

**Generate a secure JWT secret:**
```bash
# Linux/macOS
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 6. Start the Application

```bash
npm start
```

You should see:
```
✓ Database connection established successfully.
✓ Database synchronized successfully.
✓ Default admin user created (admin@example.com / admin123)
✓ Default regular user created (user@example.com / user123)
✓ AdminJS setup completed.

🚀 Server is running on http://localhost:3000
📊 AdminJS is available at http://localhost:3000/admin
```

### 7. (Optional) Add Sample Data

```bash
# In a new terminal, run:
npm run seed
```

This adds:
- 3 users (1 admin, 2 regular users)
- 3 categories (Electronics, Clothing, Books)
- 6 products
- 3 sample orders
- 5 configuration settings

## Accessing the Application

### Admin Panel
1. Open browser: http://localhost:3000/admin
2. Login with:
   - Email: `admin@example.com`
   - Password: `admin123`

### API Endpoints
Base URL: http://localhost:3000

**Test login endpoint:**
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## Common Setup Issues

### Issue: "Database connection failed"

**Solution 1:** Check PostgreSQL is running
```bash
# Linux
sudo service postgresql status
sudo service postgresql start

# macOS
brew services list
brew services start postgresql
```

**Solution 2:** Verify credentials
```bash
# Test connection
psql -U postgres -h localhost -d ecommerce_admin
# If this fails, your credentials are wrong
```

**Solution 3:** Check if database exists
```bash
psql -U postgres -l | grep ecommerce_admin
# If not found, create it:
createdb ecommerce_admin
```

### Issue: "Port 3000 already in use"

**Solution 1:** Use different port
```bash
# Edit .env
PORT=3001
```

**Solution 2:** Kill process using port
```bash
# Linux/macOS
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: "bcrypt installation failed"

**Solution:** Install build tools
```bash
# Ubuntu/Debian
sudo apt-get install build-essential python3

# macOS
xcode-select --install

# Windows
npm install --global windows-build-tools
```

### Issue: "Module not found"

**Solution:** Clean install
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Permission denied" on PostgreSQL

**Solution:** Update pg_hba.conf
```bash
# Find pg_hba.conf location
sudo -u postgres psql -c "SHOW hba_file;"

# Edit the file (backup first!)
sudo nano /etc/postgresql/<version>/main/pg_hba.conf

# Add this line:
local   all   all   md5

# Restart PostgreSQL
sudo service postgresql restart
```

## Docker Setup (Alternative)

If you prefer using Docker:

```bash
# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: ecommerce_admin
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
EOF

# Start PostgreSQL
docker-compose up -d

# Update .env with Docker database settings
# Then run the app normally
npm start
```

## Verifying Installation

### 1. Check Database Tables
```bash
psql -U postgres -d ecommerce_admin -c "\dt"
```

Should show: categories, order_items, orders, products, settings, users

### 2. Test Authentication
```bash
node test-auth.js
```

Should show all tests passing.

### 3. Access Admin Panel
- Navigate to http://localhost:3000/admin
- Login with admin credentials
- Verify you can see all resources

### 4. Test API
```bash
# Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Should return token and user info
```

## Next Steps

1. **Change Default Passwords**
   - Login to admin panel
   - Go to Users resource
   - Edit admin user and change password

2. **Explore Features**
   - View custom dashboards
   - Browse different resources
   - Test role-based access with user account

3. **Add Your Data**
   - Create categories for your business
   - Add products
   - Configure settings

4. **Customize**
   - Modify dashboard in `admin/dashboard.js`
   - Add new models as needed
   - Adjust role permissions in `admin/options.js`

## Development Tips

### Hot Reload (using nodemon)
```bash
npm install -g nodemon
nodemon server.js
```

### View Logs
The application logs important events. Check console for:
- Database connection status
- User creation
- Authentication attempts
- Errors

### Database Reset
If you need to start fresh:
```bash
# Drop and recreate database
dropdb ecommerce_admin
createdb ecommerce_admin

# Restart application (tables will be recreated)
npm start

# Add sample data
npm run seed
```

## Production Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Generate secure JWT_SECRET
- [ ] Set NODE_ENV=production
- [ ] Use managed PostgreSQL database
- [ ] Enable HTTPS/SSL
- [ ] Set up proper logging
- [ ] Configure backup strategy
- [ ] Implement rate limiting
- [ ] Set secure cookie settings
- [ ] Review and test all permissions
- [ ] Set up monitoring
- [ ] Document custom changes

## Getting Help

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review error messages in console
3. Verify all prerequisites are installed
4. Check environment variables in `.env`
5. Consult FEATURES.md for detailed documentation
6. Check logs: `tail -f /var/log/postgresql/postgresql-*.log`

## Useful Commands Reference

```bash
# PostgreSQL
psql -U postgres -l                    # List databases
psql -U postgres -d ecommerce_admin    # Connect to database
\dt                                    # List tables
\d users                               # Describe users table
\q                                     # Quit psql

# Node.js
npm start                              # Start application
npm run seed                           # Seed database
node test-auth.js                      # Test authentication
npm list                               # List installed packages

# Process Management
lsof -ti:3000                          # Find process on port 3000
ps aux | grep node                     # Find Node.js processes
kill -9 <PID>                          # Kill process
```

## Quick Reference Card

```
Application: http://localhost:3000
Admin Panel: http://localhost:3000/admin

Default Admin:
  Email: admin@example.com
  Password: admin123

Default User:
  Email: user@example.com
  Password: user123

API Endpoints:
  POST /api/login
  POST /api/logout

Database:
  Name: ecommerce_admin
  User: postgres
  Port: 5432
```

---

**Need more help?** Check the detailed [FEATURES.md](FEATURES.md) documentation.
