import React, { useEffect, useState } from 'react';
import { ApiClient } from 'adminjs';

const api = new ApiClient();

const SettingsPage = () => {
  const [settings, setSettings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formState, setFormState] = useState({ key: '', value: '' });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const response = await api.getPage({ pageName: 'settings' });
      if (response.data?.settings) {
        setSettings(response.data.settings);
      }
      setIsLoading(false);
    };

    load();
  }, []);

  const showNotice = (payload) => {
    if (window?.AdminJS?.notice) {
      window.AdminJS.notice(payload);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const key = formState.key.trim();
    const value = formState.value.trim();

    if (!key || !value) {
      showNotice({ message: 'Both key and value are required', type: 'error' });
      return;
    }

    const response = await api.callPage({ pageName: 'settings', method: 'post', data: { key, value } });

    if (response.data?.updated) {
      showNotice({ message: 'Setting saved', type: 'success' });
      setFormState({ key: '', value: '' });
      const refreshed = await api.getPage({ pageName: 'settings' });
      setSettings(refreshed.data?.settings || []);
    } else {
      showNotice({ message: 'Unable to save setting', type: 'error' });
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: '16px' }}>System Settings</h2>
      <p style={{ marginBottom: '24px' }}>Manage your key-value configuration entries below.</p>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}
      >
        <div style={{ flex: '1 1 220px' }}>
          <label htmlFor="setting-key" style={{ display: 'block', marginBottom: '8px' }}>
            Key
          </label>
          <input
            id="setting-key"
            name="key"
            value={formState.key}
            onChange={handleChange}
            placeholder="Setting key"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ flex: '2 1 320px' }}>
          <label htmlFor="setting-value" style={{ display: 'block', marginBottom: '8px' }}>
            Value
          </label>
          <input
            id="setting-value"
            name="value"
            value={formState.value}
            onChange={handleChange}
            placeholder="Setting value"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button type="submit" className="btn btn-primary">
            Save
          </button>
        </div>
      </form>

      {isLoading ? (
        <p>Loading...</p>
      ) : settings.length ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ textAlign: 'left', padding: '12px', border: '1px solid #e5e5e5' }}>Key</th>
                <th style={{ textAlign: 'left', padding: '12px', border: '1px solid #e5e5e5' }}>Value</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((setting) => (
                <tr key={setting.id}>
                  <td style={{ padding: '12px', border: '1px solid #e5e5e5' }}>{setting.key}</td>
                  <td style={{ padding: '12px', border: '1px solid #e5e5e5' }}>{setting.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No settings stored yet.</p>
      )}
    </div>
  );
};

export default SettingsPage;
