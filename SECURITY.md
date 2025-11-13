# Security Documentation

## Overview

This document outlines the security measures implemented in the eCommerce Admin Dashboard and provides guidance for production deployment.

## Implemented Security Measures

### 1. Authentication & Authorization

#### Password Security
- **Bcrypt Hashing**: All passwords are hashed using bcrypt with 10 salt rounds
- **Automatic Hashing**: Sequelize hooks automatically hash passwords on creation and updates
- **No Plain Text**: Passwords are never stored or transmitted in plain text
- **Hidden Fields**: Password fields are hidden in all AdminJS views

#### JWT Token Security
- **Token-Based Auth**: JWT tokens for API authentication
- **Expiration**: Tokens expire after 24 hours
- **Secure Storage**: Tokens stored in HTTP-only cookies when possible
- **Secret Key**: Uses environment-specific JWT_SECRET

#### Session Management
- **HttpOnly Cookies**: Prevents XSS attacks by making cookies inaccessible to JavaScript
- **Secure Flag**: Cookies only transmitted over HTTPS in production
- **SameSite Attribute**: Set to 'strict' to prevent CSRF attacks
- **Session Expiration**: 24-hour session lifetime

### 2. Role-Based Access Control (RBAC)

#### Permission Levels
- **Admin Role**: Full system access
- **User Role**: Limited read access, cannot modify system data
- **Resource-Level**: Each AdminJS resource has role-based visibility
- **Action-Level**: CRUD operations restricted by role

#### Implementation
```javascript
// Example from admin/options.js
isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin'
```

### 3. Input Validation

#### Sequelize Validators
- Email format validation
- Minimum value constraints on numeric fields
- Required field enforcement
- Unique constraints on emails and keys

#### Example Validations
```javascript
email: {
  type: DataTypes.STRING,
  allowNull: false,
  unique: true,
  validate: {
    isEmail: true
  }
}
```

### 4. SQL Injection Prevention

- **Parameterized Queries**: Sequelize ORM uses parameterized queries
- **No Raw SQL**: Avoid raw SQL queries where possible
- **Input Sanitization**: ORM handles escaping automatically

### 5. Cross-Site Scripting (XSS) Prevention

- **Template Escaping**: AdminJS automatically escapes output
- **HttpOnly Cookies**: Prevents cookie theft via XSS
- **Content-Type Headers**: Proper content type headers set

## Security Considerations for Production

### 1. CSRF Protection

**Current Implementation:**
- SameSite cookie attribute set to 'strict'
- AdminJS provides built-in CSRF protection for form submissions

**For Production APIs:**
Consider implementing additional CSRF protection for public-facing API endpoints:

```bash
npm install csrf-sync
```

Example implementation:
```javascript
const { csrfSync } = require('csrf-sync');
const { generateToken, csrfSynchronisedProtection } = csrfSync();

// Add to specific routes that need CSRF protection
app.post('/api/public-endpoint', csrfSynchronisedProtection, handler);
```

**Note**: The current implementation uses:
- JWT tokens for API authentication (stateless, CSRF-resistant)
- SameSite cookies for session-based AdminJS access
- This provides reasonable CSRF protection for most use cases

### 2. Environment Variables

**Critical Variables:**
```env
JWT_SECRET=<generate-strong-random-value>
DB_PASSWORD=<strong-database-password>
NODE_ENV=production
```

**Generate Secure Secrets:**
```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Or use openssl
openssl rand -base64 32
```

### 3. HTTPS/SSL

**Production Requirement:**
- Always use HTTPS in production
- Obtain SSL certificate (Let's Encrypt, commercial CA)
- Configure reverse proxy (Nginx, Apache) with SSL

**Nginx Example:**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. Rate Limiting

**Recommendation:** Implement rate limiting to prevent brute force attacks

```bash
npm install express-rate-limit
```

**Example Implementation:**
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later'
});

app.post('/api/login', loginLimiter, loginHandler);
```

### 5. Helmet.js for Security Headers

**Install:**
```bash
npm install helmet
```

**Usage:**
```javascript
const helmet = require('helmet');
app.use(helmet());
```

### 6. CORS Configuration

**For Production APIs:**
```bash
npm install cors
```

**Configuration:**
```javascript
const cors = require('cors');

app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

### 7. Database Security

#### Connection Security
- Use SSL/TLS for database connections
- Restrict database access by IP
- Use strong database passwords
- Regular database backups

**Example SSL Configuration:**
```javascript
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});
```

#### Database User Permissions
- Create separate database users for application
- Grant only necessary permissions
- Never use superuser accounts

### 8. Logging and Monitoring

**Implement Logging:**
```bash
npm install winston
```

**Log Important Events:**
- Authentication attempts (success/failure)
- Authorization failures
- Database errors
- API access patterns

**Example:**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log authentication attempts
logger.info('Login attempt', { email: user.email, success: true });
```

### 9. Dependency Management

**Regular Updates:**
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

**Use npm-check-updates:**
```bash
npm install -g npm-check-updates
ncu -u
npm install
```

### 10. Error Handling

**Don't Expose Sensitive Information:**
```javascript
// BAD - exposes stack trace
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.stack });
});

// GOOD - generic error message
app.use((err, req, res, next) => {
  console.error(err); // Log for debugging
  res.status(500).json({ error: 'Internal server error' });
});
```

## Production Security Checklist

### Pre-Deployment
- [ ] Change all default passwords
- [ ] Generate strong JWT_SECRET (32+ characters)
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Restrict database access
- [ ] Set up database backups
- [ ] Review all environment variables
- [ ] Remove debug/development code
- [ ] Test all authentication flows

### Security Hardening
- [ ] Implement rate limiting on login endpoint
- [ ] Add Helmet.js for security headers
- [ ] Configure CORS appropriately
- [ ] Enable database connection SSL
- [ ] Set up logging and monitoring
- [ ] Implement intrusion detection
- [ ] Regular security updates
- [ ] Configure session store (Redis in production)
- [ ] Set up automated backups
- [ ] Document incident response plan

### Monitoring & Maintenance
- [ ] Monitor failed login attempts
- [ ] Track API usage patterns
- [ ] Set up alerts for suspicious activity
- [ ] Regular vulnerability scans
- [ ] Review access logs
- [ ] Update dependencies monthly
- [ ] Security audit quarterly
- [ ] Backup testing monthly

## Common Security Issues

### Issue: Default Credentials in Production

**Risk:** High - Anyone can access admin panel

**Solution:**
1. Change default admin password immediately
2. Use strong passwords (12+ characters, mixed case, numbers, symbols)
3. Consider implementing password complexity requirements

### Issue: Weak JWT Secret

**Risk:** High - Tokens can be forged

**Solution:**
1. Generate cryptographically secure random secret
2. Never commit secrets to git
3. Use different secrets for different environments

### Issue: No Rate Limiting

**Risk:** Medium - Brute force attacks possible

**Solution:**
Implement express-rate-limit on authentication endpoints

### Issue: Missing HTTPS

**Risk:** High - Credentials can be intercepted

**Solution:**
1. Obtain SSL certificate
2. Configure web server (Nginx/Apache) with SSL
3. Force HTTPS redirects

### Issue: Exposed Error Messages

**Risk:** Medium - Information disclosure

**Solution:**
Use generic error messages in production, log details server-side

## Security Testing

### Authentication Tests
```bash
node test-auth.js
```

### Manual Security Tests

1. **Password Security**
   - Verify passwords are hashed in database
   - Test password validation
   - Confirm old passwords don't work after change

2. **Authorization**
   - Login as admin - verify full access
   - Login as user - verify restricted access
   - Attempt to access restricted resources directly

3. **Session Management**
   - Verify sessions expire
   - Test logout functionality
   - Check cookie attributes (HttpOnly, Secure, SameSite)

4. **API Security**
   - Test endpoints without authentication
   - Verify JWT expiration
   - Test with invalid tokens

### Automated Security Scanning

```bash
# Install security scanning tools
npm install -g snyk

# Scan for vulnerabilities
snyk test

# Monitor project
snyk monitor
```

## Incident Response

### If Security Breach Detected:

1. **Immediate Actions**
   - Identify affected systems
   - Isolate compromised systems
   - Change all passwords and secrets
   - Rotate JWT secrets (invalidates all tokens)
   - Review access logs

2. **Investigation**
   - Determine attack vector
   - Identify compromised data
   - Check for backdoors
   - Review all recent changes

3. **Remediation**
   - Patch vulnerabilities
   - Update dependencies
   - Strengthen security measures
   - Restore from clean backup if necessary

4. **Post-Incident**
   - Document incident
   - Update security procedures
   - Implement additional monitoring
   - Train team on lessons learned

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Sequelize Security](https://sequelize.org/docs/v6/other-topics/security/)
- [AdminJS Documentation](https://docs.adminjs.co/)

## Contact

For security issues, please contact the security team immediately and do not create public issues.

## Version History

- v1.0.0 - Initial security implementation
  - JWT authentication
  - Bcrypt password hashing
  - Role-based access control
  - Session security (HttpOnly, Secure, SameSite)
  - Input validation
