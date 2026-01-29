const SuperAdminDashboard = () => {
  return (
    <div>
      <h1>Super Admin Dashboard</h1>
      <p>Welcome {localStorage.getItem('full_name')}</p>
    </div>
  );
};

export default SuperAdminDashboard;
