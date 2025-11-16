import app from './app.js';
import { sequelize, Setting } from './models/index.js';

const PORT = process.env.PORT || 4000;

async function ensureDefaultSettings() {
  const defaultSettings = [
    { key: 'store_name', value: 'Demo Store' },
    { key: 'support_email', value: 'support@example.com' }
  ];

  await Promise.all(
    defaultSettings.map(async ({ key, value }) => {
      const [setting, created] = await Setting.findOrCreate({
        where: { key },
        defaults: { value }
      });

      if (!created && setting.value !== value) {
        await setting.update({ value });
      }
    })
  );
}

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await ensureDefaultSettings();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

start();
