import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoanContext } from '../../context/LoanContext';
import AddBorrowerModal from '../borrowers/modals/AddBorrowerModal';
import AddLoanModal from '../loans/modals/AddLoanModal';
import Buttons from './components/Buttons';
import Charts from './components/Charts';
import RecentActivity from './components/RecentActivity';
import StatsCards from './components/StatsCards';
import UpcomingDues from './components/UpcomingDues';
import './dashboard.css';
import HistoryModal from './modals/HistoryModal';

const DashboardPage = ({ initialModal }) => {
  const [openBorrowerModal, setOpenBorrowerModal] = useState(false);
  const [openLoanModal, setOpenLoanModal] = useState(false);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);
  const navigate = useNavigate();

  const { addBorrower, addLoan, fetchDashboardData } = useLoanContext();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle URL-based Modal
  useEffect(() => {
    if (initialModal === 'view-all') {
      setOpenHistoryModal(true);
    }
  }, [initialModal]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-text">
          <h2 className="dashboard-title">📊 Dashboard Overview</h2>
          <p className="dashboard-subtitle">
            Track loans, EMI collections, borrowers, and recent activities at a glance.
          </p>
        </div>

        <Buttons
          onAddBorrower={() => setOpenBorrowerModal(true)}
          onAddLoan={() => setOpenLoanModal(true)}
        />
      </div>
      <StatsCards />
      <Charts />

      <div className="activity-grid">
        <RecentActivity />
        <UpcomingDues />
      </div>
      {/* ✅ NOW CONNECTED TO CONTEXT */}
      <AddBorrowerModal
        open={openBorrowerModal}
        onClose={() => setOpenBorrowerModal(false)}
        onSave={addBorrower}
      />
      <AddLoanModal open={openLoanModal} onClose={() => setOpenLoanModal(false)} onSave={addLoan} />
      <HistoryModal
        open={openHistoryModal}
        onClose={() => {
          setOpenHistoryModal(false);
          if (initialModal === 'view-all') navigate('/dashboard');
        }}
      />
    </div>
  );
};

export default DashboardPage;
