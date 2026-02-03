import {
  Ban,
  CheckCircle,
  Edit2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCog,
  UserPlus,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Modal from '../../common/Modal';
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
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  // Create User State
  const [newUser, setNewUser] = useState({
    full_name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'STAFF',
  });

  // Edit User State
  const [editUserForm, setEditUserForm] = useState({
    full_name: '',
    email: '',
    mobile: '',
  });

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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/signup', newUser);
      toast.success('User created successfully 🎉');
      setCreateModalOpen(false);
      setNewUser({
        full_name: '',
        email: '',
        mobile: '',
        password: '',
        role: 'STAFF',
      });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
  };

  // ✅ HANDLERS FOR NEW FEATURES
  const handleEditClick = (u) => {
    setSelectedUser(u);
    setEditUserForm({
      full_name: u.full_name,
      email: u.email,
      mobile: u.mobile || '',
    });
    setEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/users/${selectedUser.user_id}`, editUserForm);
      toast.success('User details updated');
      setEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleStatusToggle = async () => {
    if (!selectedUser) return;
    const newStatus = selectedUser.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      await API.put(`/users/${selectedUser.user_id}/status`, { status: newStatus });
      toast.success(`User ${newStatus === 'ACTIVE' ? 'activated' : 'disabled'}`);
      setStatusModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
    }
  };

  return (
    <div className="manage-users-page" style={{ padding: '24px' }}>
      <div
        className="page-header"
        style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}
      >
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)' }}>
            👥 Manage Users
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Control access, roles, and status</p>
        </div>

        {user?.role === 'SUPERADMIN' ? (
          <button
            onClick={() => setCreateModalOpen(true)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <UserPlus size={18} />
            Create User
          </button>
        ) : (
          <div
            style={{
              padding: '10px 16px',
              backgroundColor: 'rgba(234, 179, 8, 0.1)',
              color: '#fbbf24',
              borderRadius: '8px',
              border: '1px solid rgba(234, 179, 8, 0.2)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ShieldAlert size={16} />
            You are logged in as <strong>{user?.role}</strong>. Management features are restricted.
          </div>
        )}
      </div>

      <div
        className="users-table-container"
        style={{
          background: 'var(--bg-surface)',
          borderRadius: '16px',
          border: '1px solid var(--border-main)',
          overflowX: 'auto',
        }}
      >
        <table className="app-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--bg-secondary)' }}>
            <tr>
              <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)' }}>
                User
              </th>
              <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)' }}>
                Contact
              </th>
              <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)' }}>
                Role
              </th>
              <th style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Status
              </th>
              <th style={{ padding: '16px', textAlign: 'right', color: 'var(--text-muted)' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: '24px', textAlign: 'center' }}>
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '24px', textAlign: 'center' }}>
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.user_id} style={{ borderBottom: '1px solid var(--border-main)' }}>
                  <td style={{ padding: '16px', color: 'var(--text-main)', fontWeight: '500' }}>
                    {u.full_name} {u.user_id === user?.userId && '(You)'}
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                    <div>{u.email}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {u.mobile || '-'}
                    </div>
                  </td>
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
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                        color: u.status === 'ACTIVE' ? '#10b981' : '#ef4444',
                        background:
                          u.status === 'ACTIVE'
                            ? 'rgba(16, 185, 129, 0.1)'
                            : 'rgba(239, 68, 68, 0.1)',
                      }}
                    >
                      {u.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      {/* EDIT BUTTON */}
                      <button
                        className="icon-btn"
                        onClick={() => handleEditClick(u)}
                        title="Edit User"
                        disabled={user?.role !== 'SUPERADMIN' && u.user_id !== user?.userId}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-main)',
                          background: 'transparent',
                          cursor: 'pointer',
                          color: '#3b82f6',
                        }}
                      >
                        <Edit2 size={16} />
                      </button>

                      {/* TOGGLE STATUS BUTTON */}
                      <button
                        className="icon-btn"
                        onClick={() => {
                          setSelectedUser(u);
                          setStatusModalOpen(true);
                        }}
                        title={u.status === 'ACTIVE' ? 'Disable User' : 'Enable User'}
                        disabled={u.role === 'SUPERADMIN' || user?.role !== 'SUPERADMIN'}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-main)',
                          background: 'transparent',
                          cursor: 'pointer',
                          color: u.status === 'ACTIVE' ? '#f59e0b' : '#10b981',
                        }}
                      >
                        {u.status === 'ACTIVE' ? <Ban size={16} /> : <CheckCircle size={16} />}
                      </button>

                      {/* ROLE BUTTON */}
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

                      {/* DELETE BUTTON */}
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

      {/* --------------------- MODALS --------------------- */}

      {/* Edit User Modal */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <div style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--text-main)' }}>Edit User Details</h3>
          <form
            onSubmit={handleUpdateUser}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  color: 'var(--text-muted)',
                }}
              >
                Name
              </label>
              <input
                type="text"
                required
                value={editUserForm.full_name}
                onChange={(e) => setEditUserForm({ ...editUserForm, full_name: e.target.value })}
                className="modal-input"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-main)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-main)',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  color: 'var(--text-muted)',
                }}
              >
                Email
              </label>
              <input
                type="email"
                required
                value={editUserForm.email}
                onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-main)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-main)',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  color: 'var(--text-muted)',
                }}
              >
                Mobile
              </label>
              <input
                type="text"
                value={editUserForm.mobile}
                onChange={(e) => setEditUserForm({ ...editUserForm, mobile: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-main)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-main)',
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                marginTop: '10px',
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: '#3b82f6',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Save Changes
            </button>
          </form>
        </div>
      </Modal>

      {/* Status Toggle Modal */}
      <Modal open={statusModalOpen} onClose={() => setStatusModalOpen(false)}>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: selectedUser?.status === 'ACTIVE' ? '#fee2e2' : '#dcfce7',
              color: selectedUser?.status === 'ACTIVE' ? '#ef4444' : '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            {selectedUser?.status === 'ACTIVE' ? <Ban size={24} /> : <CheckCircle size={24} />}
          </div>
          <h3>{selectedUser?.status === 'ACTIVE' ? 'Disable User?' : 'Activate User?'}</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            Are you sure you want to {selectedUser?.status === 'ACTIVE' ? 'disable' : 'activate'}{' '}
            <strong>{selectedUser?.full_name}</strong>?
            {selectedUser?.status === 'ACTIVE' && ' They will be unable to login.'}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => setStatusModalOpen(false)}
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
              onClick={handleStatusToggle}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                background: selectedUser?.status === 'ACTIVE' ? '#ef4444' : '#10b981',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              {selectedUser?.status === 'ACTIVE' ? 'Disable' : 'Activate'}
            </button>
          </div>
        </div>
      </Modal>

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

      {/* Create User Modal */}
      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)}>
        <div style={{ padding: '24px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-main)' }}>
              Add New User
            </h3>
            <button
              onClick={() => setCreateModalOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} color="var(--text-muted)" />
            </button>
          </div>

          <form
            onSubmit={handleCreateUser}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  color: 'var(--text-muted)',
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                required
                value={newUser.full_name}
                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-main)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-main)',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  color: 'var(--text-muted)',
                }}
              >
                Email
              </label>
              <input
                type="email"
                required
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-main)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-main)',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '14px',
                    color: 'var(--text-muted)',
                  }}
                >
                  Mobile
                </label>
                <input
                  type="text"
                  required
                  value={newUser.mobile}
                  onChange={(e) => setNewUser({ ...newUser, mobile: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-main)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '14px',
                    color: 'var(--text-muted)',
                  }}
                >
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-main)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-main)',
                    height: '46px', // match input height roughly
                  }}
                >
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPERADMIN">SuperAdmin</option>
                </select>
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  color: 'var(--text-muted)',
                }}
              >
                Password
              </label>
              <input
                type="password"
                required
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-main)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-main)',
                }}
              />
            </div>

            <div
              style={{
                marginTop: '24px',
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-main)',
                  background: 'transparent',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default ManageUsers;
