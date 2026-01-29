import BorrowersPage from '../features/borrowers/BorrowersPage';
import DashboardPage from '../features/dashboard/DashboardPage';
import LoansPage from '../features/loans/LoansPage';
import PaymentsPage from '../features/payments/PaymentsPage';
import ReportsPage from '../features/reports/ReportsPage';
import ManageUsers from '../features/settings/ManageUsers';
import SettingsPage from '../features/settings/SettingsPage';

const Dashboard = ({ activeTab, initialModal }) => {
  switch (activeTab) {
    case 'dashboard':
      return <DashboardPage initialModal={initialModal} />;

    case 'loans':
      return <LoansPage initialModal={initialModal} />;

    case 'borrowers':
      return <BorrowersPage initialModal={initialModal} />;

    case 'payments':
      return <PaymentsPage />;

    case 'reports':
      return <ReportsPage />;

    case 'settings':
      return <SettingsPage />;

    case 'manage-users':
      return <ManageUsers />;

    default:
      return <DashboardPage />;
  }
};

export default Dashboard;
