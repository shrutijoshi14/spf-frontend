const StaffDashboard = () => {
  return (
    <div>
      <h1>Staff Dashboard</h1>
      <p>Welcome {localStorage.getItem('full_name')}</p>
    </div>
  );
};

export default StaffDashboard;
