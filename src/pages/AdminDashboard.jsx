import ProtectedRoute from '../features/dashboard/components/ProtectedRoute';
import DashboardPage from '../features/dashboard/DashboardPage';
import LoansPage from '../features/loans/LoansPage';
import PaymentsPage from '../features/payments/PaymentsPage';
import ReportsPage from '../features/reports/ReportsPage';
import SettingsPage from '../features/settings/SettingsPage';

const AdminDashboard = ({ activeTab }) => {
  let Component;
  switch (activeTab) {
    case 'dashboard':
      Component = DashboardPage;
      break;
    case 'loans':
      Component = LoansPage;
      break;
    case 'payments':
      Component = PaymentsPage;
      break;
    case 'reports':
      Component = ReportsPage;
      break;
    case 'settings':
      Component = SettingsPage;
      break;
    default:
      Component = DashboardPage;
  }

  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  );
};

export default AdminDashboard;
