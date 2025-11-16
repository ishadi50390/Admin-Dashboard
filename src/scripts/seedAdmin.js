import dotenv from 'dotenv';
import { sequelize, User } from '../models/index.js';

dotenv.config();

const DEFAULT_ADMIN = {
  name: 'System Admin',
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin'
};

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const [admin, created] = await User.findOrCreate({
      where: { email: DEFAULT_ADMIN.email },
      defaults: DEFAULT_ADMIN
    });

    if (created) {
      console.log('Default admin user created with email admin@example.com and password admin123');
    } else {
      console.log('Admin user already exists.');
    }
  } catch (error) {
    console.error('Failed to seed admin user:', error);
  } finally {
    await sequelize.close();
  }
}

seedAdmin();
