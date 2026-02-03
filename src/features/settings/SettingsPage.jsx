import { Database, FileText, Moon, Save, Settings, Sun, Trash2, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/modal.css';
import API from '../../utils/api';
import TrashManager from './components/TrashManager';
import ManageUsers from './ManageUsers.jsx';
import './settings.css';

const SettingsPage = () => {
  const { theme, toggleTheme, setTheme, updateTheme, accentColor, updateAccent } = useTheme();
  const { isSuperAdmin, isAdmin, user: currentUser, hasPermission } = useAuth();
  const [settings, setSettings] = useState({
    penalty_amount: '50',
    penalty_enabled: 'true',
    penalty_days: '5',
    theme: theme,
  });

  // RBAC State
  const [permissions, setPermissions] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await API.get('/settings');
      if (res.data.success) {
        setSettings((prev) => ({ ...prev, ...res.data.data }));
        // Only update context if backend theme is different from current
        if (res.data.data.theme && res.data.data.theme !== theme) {
          setTheme(res.data.data.theme);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load settings');
    }
  };

  const fetchPermissions = async () => {
    if (!isAdmin) return;
    try {
      const res = await API.get('/settings/permissions');
      if (res.data.success) {
        setPermissions(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch permissions', err);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [isAdmin]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await API.post('/settings', {
        ...settings,
        theme: theme, // ensure current theme is synced
      });
      if (res.data.success) {
        toast.success('Settings updated successfully');
        setSettings((prev) => ({ ...prev, ...res.data.data }));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (data, filename) => {
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleBackup = async () => {
    try {
      toast.loading('Generating backup...');
      const res = await API.get('/settings/backup', { responseType: 'blob' });
      toast.dismiss();
      downloadFile(res.data, `spf_backup_${new Date().toISOString().split('T')[0]}.json`);
      toast.success('Backup downloaded successfully');
    } catch (err) {
      toast.dismiss();
      toast.error('Backup failed');
      console.error(err);
    }
  };

  const handleExport = async (type) => {
    try {
      toast.loading(`Exporting ${type}...`);
      const res = await API.get(`/settings/export/${type}`, { responseType: 'blob' });
      toast.dismiss();
      downloadFile(res.data, `${type}_export.csv`);
      toast.success(`${type} exported successfully`);
    } catch (err) {
      toast.dismiss();
      toast.error('Export failed');
      console.error(err);
    }
  };

  const handlePermissionToggle = async (permissionCode, role, currentStatus) => {
    try {
      // Optimistic update
      const newStatus = !currentStatus;
      setPermissions((prev) =>
        prev.map((p) => (p.permission_code === permissionCode ? { ...p, [role]: newStatus } : p))
      );

      await API.put('/settings/permissions', [
        { role, permission_code: permissionCode, enabled: newStatus },
      ]);
      toast.success('Permission updated');
    } catch (err) {
      toast.error('Failed to update permission');
      fetchPermissions(); // Revert on error
    }
  };

  return (
    <div className="settings-page">
      <Toaster position="top-right" />

      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">⚙️ Settings</h2>
          <p className="page-subtitle">Personalize your experience and system behavior</p>
        </div>
        <button className="save-all-btn" onClick={handleSave} disabled={loading}>
          <Save size={20} />
          {loading ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <div className="settings-grid">
        {/* Appearance Section */}
        <div className="settings-card card-appearance">
          <div className="card-header">
            <div className="card-icon-box theme">
              <Sun size={20} className="sun-icon" />
              <Moon size={20} className="moon-icon" />
            </div>
            <div className="card-header-text">
              <h3>Appearance</h3>
              <p>Customize how the platform looks</p>
            </div>
          </div>

          <div className="card-body">
            <div className="setting-item">
              <div className="setting-info">
                <label>Dynamic Theme</label>
                <p>Switch between Light and Dark interface</p>
              </div>
              <div className="theme-toggle-group">
                <button
                  className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => updateTheme('light')}
                >
                  <Sun size={16} /> Light
                </button>
                <button
                  className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => updateTheme('dark')}
                >
                  <Moon size={16} /> Dark
                </button>
              </div>
            </div>

            <div
              className="setting-item"
              style={{
                marginTop: '16px',
                borderTop: '1px solid var(--border-main)',
                paddingTop: '16px',
              }}
            >
              <div className="setting-info">
                <label>Brand Color</label>
                <p>Choose your primary accent color</p>
              </div>
              <div
                className="color-options"
                style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}
              >
                {[
                  { color: '#3b82f6', name: 'Blue' },
                  { color: '#10b981', name: 'Emerald' },
                  { color: '#8b5cf6', name: 'Purple' },
                  { color: '#f59e0b', name: 'Amber' },
                  { color: '#f43f5e', name: 'Rose' },
                ].map((c) => (
                  <button
                    key={c.color}
                    onClick={() => updateAccent(c.color)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: c.color,
                      border:
                        accentColor === c.color
                          ? '3px solid var(--bg-surface)'
                          : '2px solid transparent',
                      boxShadow: accentColor === c.color ? `0 0 0 2px ${c.color}` : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System Configuration (Admins Only) */}
        {hasPermission('settings.edit') && (
          <div className="settings-card card-system">
            <div className="card-header">
              <div className="card-icon-box system">
                <Settings size={20} />
              </div>
              <div className="card-header-text">
                <h3>Loan Operations</h3>
                <p>Configure automated system rules</p>
              </div>
            </div>

            <div className="card-body">
              <div className="setting-item">
                <div className="setting-info">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Automated Penalties
                    {!isSuperAdmin && (
                      <span
                        style={{
                          fontSize: '12px',
                          background: 'var(--bg-secondary)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: '1px solid var(--border-main)',
                        }}
                      >
                        🔒 Super Admin Only
                      </span>
                    )}
                  </label>
                  <p>Enable daily fines for late payments</p>
                </div>
                <label className={`switch ${!isSuperAdmin ? 'disabled' : ''}`}>
                  <input
                    type="checkbox"
                    checked={settings.penalty_enabled === 'true'}
                    onChange={(e) =>
                      setSettings({ ...settings, penalty_enabled: String(e.target.checked) })
                    }
                    disabled={!isSuperAdmin}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div
                className={`setting-item input-group ${
                  settings.penalty_enabled !== 'true' || !isSuperAdmin ? 'disabled' : ''
                }`}
              >
                <div className="setting-info">
                  <label>Daily Penalty Amount</label>
                  <p>Fine amount applied per day (₹)</p>
                </div>
                <div className="input-wrapper-inner">
                  <span className="currency-prefix">₹</span>
                  <input
                    type="number"
                    className="settings-input"
                    value={settings.penalty_amount}
                    onChange={(e) => setSettings({ ...settings, penalty_amount: e.target.value })}
                    disabled={!isSuperAdmin || settings.penalty_enabled !== 'true'}
                  />
                </div>
              </div>

              <div
                className={`setting-item input-group ${
                  settings.penalty_enabled !== 'true' || !isSuperAdmin ? 'disabled' : ''
                }`}
              >
                <div className="setting-info">
                  <label>Penalty Start Day</label>
                  <p>Day of month when penalties begin (Default: 5th)</p>
                </div>
                <div className="input-wrapper-inner">
                  <span className="currency-prefix">Day</span>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    className="settings-input"
                    value={settings.penalty_days}
                    onChange={(e) => setSettings({ ...settings, penalty_days: e.target.value })}
                    disabled={!isSuperAdmin || settings.penalty_enabled !== 'true'}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management (RBAC Controlled) */}
        {hasPermission('users.view') && (
          <div
            className="settings-card full-width card-users"
            style={{ gridColumn: '1 / -1', padding: 0, overflow: 'hidden' }}
          >
            <ManageUsers />
          </div>
        )}

        {/* Trash / Recovery Manager (Admins Only) */}
        {isAdmin && (
          <div className="settings-card card-trash" style={{ gridColumn: '1 / -1' }}>
            <div className="card-header">
              <div
                className="card-icon-box"
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
              >
                <Trash2 size={20} />
              </div>
              <div className="card-header-text">
                <h3>Trash & Recovery</h3>
                <p>Restore accidentally deleted borrowers and loans</p>
              </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <TrashManager />
            </div>
          </div>
        )}

        {hasPermission('settings.edit') && (
          <div
            className="settings-card card-data full-width disabled-opacity"
            style={{ gridColumn: '1 / -1' }}
          >
            <div className="card-header">
              <div className="card-icon-box database">
                <Database size={20} />
              </div>
              <div className="card-header-text">
                <h3>Data Management</h3>
                <p>Export reports and manage backups</p>
              </div>
            </div>
            <div className="card-body">
              <div className="data-actions">
                <button className="export-btn" onClick={handleBackup}>
                  <Database size={24} />
                  <span>Backup Database</span>
                </button>
                <button className="export-btn" onClick={() => handleExport('loans')}>
                  <FileText size={24} />
                  <span>Export Loans</span>
                </button>
                <button className="export-btn" onClick={() => handleExport('payments')}>
                  <FileText size={24} />
                  <span>Export Payments</span>
                </button>
                <button className="export-btn" onClick={() => handleExport('users')}>
                  <Users size={24} />
                  <span>Export Users</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Role Permissions (Admin Only) */}
      {hasPermission('settings.edit') && (
        <div
          className="settings-card full-width matrix-card"
          style={{ gridColumn: '1 / -1', marginTop: '24px' }}
        >
          <div className="card-header">
            <div
              className="card-icon-box"
              style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}
            >
              <Settings size={20} />
            </div>
            <div className="card-header-text">
              <h3>Role Access Matrix</h3>
              <p>Define what Admins and Staff can and cannot do</p>
            </div>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            <div
              className="table-scroll-container"
              style={{
                height: '400px',
                overflow: 'auto',
                border: '1.5px solid var(--border-main)',
                borderRadius: '12px',
              }}
            >
              <table
                className="app-table"
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  minWidth: '600px',
                }}
              >
                <thead
                  style={{
                    background: 'var(--bg-secondary)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  <tr>
                    <th
                      style={{
                        padding: '16px',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        width: '60px',
                      }}
                    >
                      Sr. No.
                    </th>
                    <th
                      style={{
                        padding: '16px',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Action / Capability
                    </th>
                    <th
                      style={{
                        padding: '16px',
                        textAlign: 'center',
                        width: '120px',
                        color: 'var(--text-muted)',
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Admin
                    </th>
                    <th
                      style={{
                        padding: '16px',
                        textAlign: 'center',
                        width: '120px',
                        color: 'var(--text-muted)',
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Staff
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((p, index) => {
                    const prevCategory = index > 0 ? permissions[index - 1].category : null;
                    const showHeader = p.category !== prevCategory;

                    return (
                      <React.Fragment key={p.permission_code}>
                        {showHeader && (
                          <tr
                            style={{
                              background: 'rgba(37, 99, 235, 0.05)',
                              borderBottom: '1px solid var(--border-main)',
                            }}
                          >
                            <td
                              colSpan="4"
                              style={{
                                padding: '12px 16px',
                                fontSize: '12px',
                                fontWeight: '900',
                                color: 'var(--accent)',
                                textTransform: 'uppercase',
                                letterSpacing: '1.5px',
                                textAlign: 'center',
                                background: 'var(--bg-secondary)',
                              }}
                            >
                              {p.category}
                            </td>
                          </tr>
                        )}
                        <tr
                          className="permission-row"
                          style={{
                            borderBottom: '1px solid var(--border-main)',
                            transition: 'background 0.2s ease',
                          }}
                        >
                          <td
                            style={{
                              padding: '16px',
                              textAlign: 'center',
                              fontWeight: '600',
                              color: 'var(--text-muted)',
                              fontSize: '13px',
                            }}
                          >
                            {index + 1}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <div
                              style={{
                                fontWeight: '700',
                                color: 'var(--text-main)',
                                fontSize: '14px',
                                marginBottom: '4px',
                              }}
                            >
                              {p.description}
                            </div>
                            <div
                              style={{
                                fontSize: '11px',
                                color: 'var(--text-muted)',
                                fontFamily: 'monospace',
                                background: 'var(--bg-secondary)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                display: 'inline-block',
                              }}
                            >
                              {p.permission_code}
                            </div>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <label className="switch" style={{ transform: 'scale(0.85)' }}>
                              <input
                                type="checkbox"
                                checked={!!p.ADMIN}
                                onChange={() =>
                                  handlePermissionToggle(p.permission_code, 'ADMIN', p.ADMIN)
                                }
                              />
                              <span className="slider round"></span>
                            </label>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <label className="switch" style={{ transform: 'scale(0.85)' }}>
                              <input
                                type="checkbox"
                                checked={!!p.STAFF}
                                onChange={() =>
                                  handlePermissionToggle(p.permission_code, 'STAFF', p.STAFF)
                                }
                              />
                              <span className="slider round"></span>
                            </label>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
