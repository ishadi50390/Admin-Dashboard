require('dotenv').config();
const { User } = require('./models');
const bcrypt = require('bcrypt');

async function testAuth() {
  try {
    console.log('🧪 Testing Authentication System...\n');

    // Test 1: Create a test user
    console.log('Test 1: Creating test user...');
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@test.com',
      password: 'test123',
      role: 'user'
    });
    console.log('✓ Test user created');

    // Test 2: Verify password is hashed
    console.log('\nTest 2: Verifying password hashing...');
    if (testUser.password !== 'test123' && testUser.password.startsWith('$2b$')) {
      console.log('✓ Password is properly hashed');
      console.log(`  Raw password: test123`);
      console.log(`  Hashed password: ${testUser.password.substring(0, 20)}...`);
    } else {
      console.log('✗ Password hashing failed');
      throw new Error('Password not hashed');
    }

    // Test 3: Verify validatePassword method works
    console.log('\nTest 3: Testing password validation...');
    const isValidCorrect = await testUser.validatePassword('test123');
    const isValidWrong = await testUser.validatePassword('wrongpassword');
    
    if (isValidCorrect && !isValidWrong) {
      console.log('✓ Password validation works correctly');
      console.log(`  Correct password returns: ${isValidCorrect}`);
      console.log(`  Wrong password returns: ${isValidWrong}`);
    } else {
      console.log('✗ Password validation failed');
      throw new Error('Password validation not working');
    }

    // Test 4: Test password update hashing
    console.log('\nTest 4: Testing password update hashing...');
    const oldHash = testUser.password;
    testUser.password = 'newpassword123';
    await testUser.save();
    
    if (testUser.password !== oldHash && testUser.password !== 'newpassword123') {
      console.log('✓ Password update hashing works');
      console.log(`  Old hash: ${oldHash.substring(0, 20)}...`);
      console.log(`  New hash: ${testUser.password.substring(0, 20)}...`);
    } else {
      console.log('✗ Password update hashing failed');
      throw new Error('Password update not hashed');
    }

    // Test 5: Verify new password works
    console.log('\nTest 5: Verifying new password...');
    const isNewPasswordValid = await testUser.validatePassword('newpassword123');
    const isOldPasswordInvalid = await testUser.validatePassword('test123');
    
    if (isNewPasswordValid && !isOldPasswordInvalid) {
      console.log('✓ New password works correctly');
    } else {
      console.log('✗ New password validation failed');
      throw new Error('New password not working');
    }

    // Cleanup
    await testUser.destroy();
    console.log('\n✓ Test user cleaned up');

    console.log('\n✅ All authentication tests passed!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
const { sequelize } = require('./models');
sequelize.authenticate()
  .then(() => {
    console.log('✓ Database connected\n');
    return sequelize.sync();
  })
  .then(() => testAuth())
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });
