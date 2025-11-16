import dotenv from 'dotenv';
import adminJs from '../src/admin/index.js';
import { sequelize, User } from '../src/models/index.js';

dotenv.config();

async function main() {
  try {
    await sequelize.authenticate();
    const admin = await User.findOne({ where: { role: 'admin' } });
    const regularUser = await User.findOne({ where: { role: 'user' } });

    const runCase = async (label, actor) => {
      if (!actor) {
        console.log(`${label}: no user found`);
        return;
      }

      const dashboardData = await adminJs.options.dashboard.handler(null, null, {
        currentAdmin: {
          id: actor.id,
          email: actor.email,
          name: actor.name,
          role: actor.role
        }
      });

      console.log(`--- ${label} handler result ---`);
      console.log(JSON.stringify(dashboardData, null, 2));
    };

    await runCase('Admin', admin);
    await runCase('User', regularUser);
  } catch (error) {
    console.error('Dashboard inspection failed:', error);
  } finally {
    await sequelize.close();
  }
}

main();
