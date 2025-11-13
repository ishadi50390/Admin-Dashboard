const { Setting } = require('../models');

const SettingsPage = {
  handler: async (request, response, context) => {
    const { currentAdmin } = context;

    // Only admins can access settings
    if (currentAdmin.role !== 'admin') {
      return {
        html: `
          <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h1 style="color: #f44336;">Access Denied</h1>
            <p>You don't have permission to access this page.</p>
          </div>
        `
      };
    }

    try {
      const settings = await Setting.findAll({
        order: [['key', 'ASC']]
      });

      const settingsRows = settings.map(setting => `
        <tr style="border-bottom: 1px solid #e0e0e0;">
          <td style="padding: 15px; font-weight: 500; color: #333;">${setting.key}</td>
          <td style="padding: 15px; color: #666;">${setting.value || '-'}</td>
          <td style="padding: 15px; color: #888; font-size: 14px;">${setting.description || '-'}</td>
          <td style="padding: 15px;">
            <a href="/admin/resources/Setting/records/${setting.id}/edit" 
               style="padding: 6px 12px; background: #2196f3; color: white; text-decoration: none; border-radius: 4px; font-size: 14px;">
              Edit
            </a>
          </td>
        </tr>
      `).join('');

      return {
        html: `
          <div style="padding: 20px; font-family: Arial, sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin: 0;">Settings Management</h1>
              <a href="/admin/resources/Setting/actions/new" 
                 style="padding: 10px 20px; background: #4caf50; color: white; text-decoration: none; border-radius: 5px; font-weight: 500;">
                + Add New Setting
              </a>
            </div>

            <div style="background: white; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
              ${settings.length > 0 ? `
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background: #f5f5f5; border-bottom: 2px solid #e0e0e0;">
                      <th style="padding: 15px; text-align: left; font-weight: 600; color: #333;">Key</th>
                      <th style="padding: 15px; text-align: left; font-weight: 600; color: #333;">Value</th>
                      <th style="padding: 15px; text-align: left; font-weight: 600; color: #333;">Description</th>
                      <th style="padding: 15px; text-align: left; font-weight: 600; color: #333;">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${settingsRows}
                  </tbody>
                </table>
              ` : `
                <div style="padding: 40px; text-align: center; color: #999;">
                  <p style="font-size: 18px; margin: 0;">No settings configured yet.</p>
                  <p style="margin: 10px 0 0 0;">Click "Add New Setting" to create your first setting.</p>
                </div>
              `}
            </div>

            <div style="margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 10px;">
              <h3 style="margin: 0 0 10px 0; color: #333;">About Settings</h3>
              <p style="margin: 0; color: #666; line-height: 1.6;">
                Settings allow you to store key-value configuration data for your application.
                These can include site name, email settings, feature flags, and other configurable options.
              </p>
            </div>
          </div>
        `
      };
    } catch (error) {
      console.error('Settings page error:', error);
      return {
        html: `
          <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h1 style="color: #f44336;">Error</h1>
            <p>Failed to load settings. Please try again.</p>
          </div>
        `
      };
    }
  }
};

module.exports = SettingsPage;
