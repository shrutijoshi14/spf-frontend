import { Shield, ShieldAlert, ShieldCheck, Trash2, UserCog } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Modal from '../../common/Modal'; // Assuming generic modal is available
import { useAuth } from '../../context/AuthContext.jsx';
import API from '../../utils/api';

const ManageUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleUpdate = async (newRole) => {
    if (!selectedUser) return;
    try {
      await API.put(`/users/${selectedUser.user_id}/role`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
      setRoleModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await API.delete(`/users/${selectedUser.user_id}`);
      toast.success('User deleted');
      fetchUsers();
      setDeleteModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="manage-users-page" style={{ padding: '24px' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)' }}>
          👥 Manage Users
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Control access and roles for your team</p>
      </div>

      <div
        className="users-table-container"
        style={{
          background: 'var(--bg-surface)',
          borderRadius: '16px',
          border: '1px solid var(--border-main)',
          overflow: 'hidden',
        }}
      >
        <table className="app-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--bg-secondary)' }}>
            <tr>
              <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)' }}>
                User
              </th>
              <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)' }}>
                Email
              </th>
              <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)' }}>
                Role
              </th>
              <th style={{ padding: '16px', textAlign: 'right', color: 'var(--text-muted)' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ padding: '24px', textAlign: 'center' }}>
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '24px', textAlign: 'center' }}>
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.user_id} style={{ borderBottom: '1px solid var(--border-main)' }}>
                  <td style={{ padding: '16px', color: 'var(--text-main)', fontWeight: '500' }}>
                    {u.full_name} {u.user_id === user?.userId && '(You)'}
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '16px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background:
                          u.role === 'SUPERADMIN'
                            ? 'rgba(139, 92, 246, 0.1)'
                            : u.role === 'ADMIN'
                              ? 'rgba(16, 185, 129, 0.1)'
                              : 'rgba(100, 116, 139, 0.1)',
                        color:
                          u.role === 'SUPERADMIN'
                            ? '#8b5cf6'
                            : u.role === 'ADMIN'
                              ? '#10b981'
                              : '#64748b',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {u.role === 'SUPERADMIN' ? (
                        <ShieldAlert size={12} />
                      ) : u.role === 'ADMIN' ? (
                        <ShieldCheck size={12} />
                      ) : (
                        <Shield size={12} />
                      )}
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        className="icon-btn"
                        onClick={() => {
                          setSelectedUser(u);
                          setRoleModalOpen(true);
                        }}
                        title="Change Role"
                        disabled={u.role === 'SUPERADMIN' && user?.role !== 'SUPERADMIN'}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-main)',
                          background: 'transparent',
                          cursor: 'pointer',
                          color: 'var(--text-main)',
                        }}
                      >
                        <UserCog size={16} />
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => {
                          setSelectedUser(u);
                          setDeleteModalOpen(true);
                        }}
                        title="Delete User"
                        disabled={u.role === 'SUPERADMIN' || user?.role !== 'SUPERADMIN'}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-main)',
                          background: 'transparent',
                          cursor: 'pointer',
                          color: '#ef4444',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Role Manager Modal */}
      <Modal open={roleModalOpen} onClose={() => setRoleModalOpen(false)}>
        <div style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--text-main)' }}>
            Change Role for {selectedUser?.full_name}
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            Current Role: <strong>{selectedUser?.role}</strong>
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Admin can make others SuperAdmin */}
            {(user?.role === 'SUPERADMIN' || user?.role === 'ADMIN') && (
              <button
                onClick={() => handleRoleUpdate('SUPERADMIN')}
                className="role-btn superadmin"
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #8b5cf6',
                  background: 'rgba(139, 92, 246, 0.1)',
                  color: '#8b5cf6',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <ShieldAlert size={18} />
                Promote to SuperAdmin
              </button>
            )}

            {/* SuperAdmin can make others Admin or Staff */}
            {user?.role === 'SUPERADMIN' && (
              <>
                <button
                  onClick={() => handleRoleUpdate('ADMIN')}
                  className="role-btn admin"
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #10b981',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <ShieldCheck size={18} />
                  Change to Admin
                </button>
                <button
                  onClick={() => handleRoleUpdate('STAFF')}
                  className="role-btn staff"
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #64748b',
                    background: 'rgba(100, 116, 139, 0.1)',
                    color: '#64748b',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <Shield size={18} />
                  Change to Staff
                </button>
              </>
            )}

            {/* If neither matches (safety check), show nothing or a message */}
            {user?.role !== 'SUPERADMIN' && user?.role !== 'ADMIN' && (
              <p style={{ color: 'red' }}>You do not have permission to change roles.</p>
            )}
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setRoleModalOpen(false)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-main)',
                background: 'transparent',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: '#fee2e2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Trash2 size={24} />
          </div>
          <h3>Delete User?</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            Are you sure you want to remove <strong>{selectedUser?.full_name}</strong>? This action
            cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => setDeleteModalOpen(false)}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: '1px solid var(--border-main)',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--text-main)',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                background: '#ef4444',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Delete User
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageUsers;
