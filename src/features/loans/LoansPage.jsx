import { Download, Search, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../common/ConfirmationModal';
import { useAuth } from '../../context/AuthContext';
import { useLoanContext } from '../../context/LoanContext';
import API from '../../utils/api';
import AddBorrowerModal from '../borrowers/modals/AddBorrowerModal';
import Buttons from '../dashboard/components/Buttons';
import AddPaymentModal from '../payments/modals/AddPaymentModal';
import LoansTable from './components/LoansTable';
import './loans.css';
import AddLoanModal from './modals/AddLoanModal';
import AddPenaltyModal from './modals/AddPenaltyModal';
import AddTopupModal from './modals/AddTopupModal';
import EditLoanModal from './modals/EditLoanModal';
import ImportLoansModal from './modals/ImportLoansModal';
import ViewLoanModal from './modals/ViewLoanModal';

const LoansPage = ({ initialModal }) => {
  const {
    loans,
    borrowers,
    addBorrower,
    addLoan,
    updateBorrower,
    deleteBorrower,
    deleteLoan,
    addPayment,
    addTopup,
    addPenalty,
    fetchLoans,
  } = useLoanContext();
  const { hasPermission } = useAuth();

  const navigate = useNavigate();
  const { loanId } = useParams();

  const [openView, setOpenView] = useState(false);
  const [openPay, setOpenPay] = useState(false);
  const [openTopup, setOpenTopup] = useState(false);
  const [openPenalty, setOpenPenalty] = useState(false);
  const [openEditLoan, setOpenEditLoan] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [importType, setImportType] = useState('loans');
  const [openLoanModal, setOpenLoanModal] = useState(false);
  const [openAddBorrower, setOpenAddBorrower] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, data: null });
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Trigger for forcing ViewLoan update

  const [selectedLoan, setSelectedLoan] = useState(null);

  // Sync state with URL params & initialModal
  useEffect(() => {
    if (loanId && loans.length > 0) {
      const loan = loans.find((l) => String(l.loan_id) === String(loanId));
      if (loan) {
        setSelectedLoan(loan);

        // Open specific modal based on route
        if (initialModal === 'edit-loan') {
          setOpenEditLoan(true);
        } else if (initialModal === 'pay-loan') {
          setOpenPay(true);
        } else if (initialModal === 'topup-loan') {
          setOpenTopup(true);
        } else if (initialModal === 'penalty-loan') {
          setOpenPenalty(true);
        } else if (initialModal === 'delete-loan') {
          setConfirmDelete({ open: true, data: loan });
        } else {
          // Default to View
          setOpenView(true);
        }
      }
    } else {
      // Close all if no ID
      setOpenView(false);
      setOpenEditLoan(false);
      setOpenPay(false);
      setOpenTopup(false);
      setOpenPenalty(false);
      setConfirmDelete({ open: false, data: null });
    }
  }, [loanId, loans, initialModal]);

  // Handle Add Loan separately (no ID)
  useEffect(() => {
    if (initialModal === 'add-loan') {
      setOpenLoanModal(true);
    }
  }, [initialModal]);

  // ✅ Check for Automatic Penalties on Mount
  useEffect(() => {
    const checkPenalties = async () => {
      try {
        await API.get('/penalties/check-daily');

        // No need to alert user or do anything, just happens in background.
        // But maybe refresh loans if needed.
        // For now, next action usually fetches loans anyway (if context does it).
      } catch (err) {
        console.error('Failed to check daily penalties', err);
      }
    };

    checkPenalties();
  }, []);

  const handleView = (row) => {
    navigate(`/loans/view/${row.loan_id}`);
  };

  const handlePayClick = (row) => {
    setSelectedLoan(row);
    setOpenPay(true);
  };

  const handleEditClick = (row) => {
    navigate(`/loans/edit/${row.loan_id}`);
  };

  const handleTopupClick = (row) => {
    setSelectedLoan(row);
    setOpenTopup(true);
  };

  const handlePenaltyClick = (row) => {
    setSelectedLoan(row);
    setOpenPenalty(true);
  };

  const handlePaymentSubmit = async (paymentData) => {
    const res = await addPayment(paymentData);
    if (res.success) {
      setOpenPay(false);
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const handleTopupSubmit = async (topupData) => {
    const res = await addTopup(topupData);
    if (res.success) {
      setOpenTopup(false);
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const handlePenaltySubmit = async (penaltyData) => {
    const res = await addPenalty(penaltyData);
    if (res.success) {
      setOpenPenalty(false);
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const handleImportSuccess = (result) => {
    toast.success(result.message);
    fetchLoans(searchTerm); // Keep existing search refresh
    setRefreshTrigger((prev) => prev + 1);
  };

  /* ... imports remain same ... */

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Active'); // Default to Active as requested

  // ✅ Server-Side Search (Debounced)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLoans(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Client-side Status Filter (Loans are already searched by backend)
  const filteredLoans = loans.filter((loan) => {
    const matchesStatus =
      filterStatus === 'All' ||
      (filterStatus === 'Active' && loan.status.toUpperCase() === 'ACTIVE') ||
      (filterStatus === 'Closed' && loan.status.toUpperCase() === 'CLOSED') ||
      (filterStatus === 'Overdue' && loan.status.toUpperCase() === 'OVERDUE');

    return matchesStatus;
  });

  // Export Logic matching Table columns
  const handleExport = () => {
    const csvHeader = [
      'LoanID,Borrower,Principal,Interest Rate,Interest Amount (M),Penalty Paid,Outstanding Principal,Status,DisbursementDate',
    ];
    const csvRows = filteredLoans.map((l) => {
      const bName = borrowers.find((b) => b.borrower_id === l.borrower_id)?.full_name || 'Unknown';
      const monthlyInterest = Math.round((l.principal_amount * l.interest_rate) / 100);
      return `${l.loan_id},"${bName}",${l.principal_amount},${l.interest_rate},${monthlyInterest},${l.penalty_paid || 0},${l.outstanding_amount},${l.status},${l.disbursement_date}`;
    });
    const csvString = [csvHeader, ...csvRows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loans_${filterStatus.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="loans-page">
      <div className="dashboard-header">
        <div className="dashboard-text">
          <h2 className="dashboard-title">💵 Loans</h2>
          <p className="dashboard-subtitle">Manage borrowers, loans and payments</p>
        </div>

        <Buttons
          onAddBorrower={() => setOpenAddBorrower(true)}
          onAddLoan={() => setOpenLoanModal(true)}
        />
      </div>

      {/* TOOLBAR */}
      <div className="loans-toolbar">
        {/* ROW 1: Full Width Search */}
        <div className="loans-search-row">
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search loans, borrowers, payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="loans-search-input"
          />
        </div>

        {/* ROW 2: Filters & Actions */}
        <div className="loans-controls-row">
          <div className="loans-filter-group">
            {['All', 'Active', 'Closed', 'Overdue'].map((status) => {
              const isActive = filterStatus === status;

              // Color configs
              let colors;
              switch (status) {
                case 'Active':
                  colors = { solid: '#10b981', light: 'rgba(16, 185, 129, 0.1)', text: '#10b981' };
                  break;
                case 'Overdue':
                  colors = { solid: '#ef4444', light: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' };
                  break;
                case 'Closed':
                  colors = {
                    solid: 'var(--text-muted)',
                    light: 'var(--bg-secondary)',
                    text: 'var(--text-muted)',
                  };
                  break;
                default:
                  colors = {
                    solid: 'var(--accent)',
                    light: 'var(--nav-active)',
                    text: 'var(--accent)',
                  };
              }

              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className="loans-filter-btn"
                  style={{
                    borderColor: colors.solid,
                    // Active: Dark Solid Color, White Text
                    // Inactive: Light Background, Darker Colored Text
                    background: isActive ? colors.solid : colors.light,
                    color: isActive ? 'white' : colors.text,
                    boxShadow: isActive ? `0 4px 6px -1px ${colors.solid}40` : 'none',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.target.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.target.style.opacity = '1';
                  }}
                >
                  {status}
                </button>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div className="loans-action-group">
            <button
              onClick={() => {
                setImportType('loans');
                setOpenImport(true);
              }}
              className="loans-action-btn"
              style={{
                border: '1px solid var(--border-main)',
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--bg-secondary)';
                e.target.style.borderColor = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--bg-surface)';
                e.target.style.borderColor = 'var(--border-main)';
              }}
            >
              <Upload size={16} /> Import
            </button>
            <button
              onClick={handleExport}
              className="loans-action-btn"
              style={{
                border: 'none',
                background: '#10b981',
                color: 'white',
                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
              }}
              onMouseEnter={(e) => (e.target.style.background = '#059669')}
              onMouseLeave={(e) => (e.target.style.background = '#10b981')}
            >
              <Download size={16} /> Export
            </button>
          </div>
        </div>
      </div>

      <LoansTable
        loans={filteredLoans}
        onView={handleView}
        onPay={handlePayClick}
        onTopup={handleTopupClick}
        onPenalty={handlePenaltyClick}
        onDelete={
          hasPermission('loan.delete')
            ? (row) => setConfirmDelete({ open: true, data: row })
            : undefined
        }
      />

      <AddLoanModal
        open={openLoanModal}
        onClose={() => {
          setOpenLoanModal(false);
          if (initialModal === 'add-loan') navigate('/loans');
        }}
        onSave={async (data) => {
          const res = await addLoan(data);
          if (res.success && initialModal === 'add-loan') navigate('/loans');
        }}
      />

      <AddBorrowerModal open={openAddBorrower} onClose={() => setOpenAddBorrower(false)} />

      {/* ✅ VIEW LOAN MODAL */}
      <ViewLoanModal
        open={openView}
        loanId={selectedLoan?.loan_id}
        onClose={() => navigate('/loans')}
        onEdit={(loan) => {
          navigate(`/loans/edit/${loan.loan_id}`);
        }}
        onPay={handlePayClick}
        onTopup={handleTopupClick}
        onPenalty={handlePenaltyClick}
        onImport={(type) => {
          setImportType(type || 'loans');
          setOpenImport(true);
        }}
        refreshTrigger={refreshTrigger}
      />

      <EditLoanModal
        open={openEditLoan}
        loan={selectedLoan}
        onClose={() => {
          setOpenEditLoan(false);
          navigate('/loans');
        }}
      />

      {/* ✅ PAYMENT MODAL */}
      <AddPaymentModal
        open={openPay}
        loan={selectedLoan}
        onClose={() => {
          setOpenPay(false);
          navigate('/loans');
        }}
        onSubmit={async (data) => {
          await handlePaymentSubmit(data); // wrap to handle navigation
          navigate('/loans');
        }}
      />

      {/* ✅ TOPUP MODAL */}
      <AddTopupModal
        open={openTopup}
        loan={selectedLoan}
        onClose={() => {
          setOpenTopup(false);
          navigate('/loans');
        }}
        onSubmit={async (data) => {
          await handleTopupSubmit(data);
          navigate('/loans');
        }}
      />

      {/* ✅ PENALTY MODAL */}
      <AddPenaltyModal
        open={openPenalty}
        loan={selectedLoan}
        onClose={() => {
          setOpenPenalty(false);
          navigate('/loans');
        }}
        onSubmit={async (data) => {
          await handlePenaltySubmit(data);
          navigate('/loans');
        }}
      />

      <ImportLoansModal
        open={openImport}
        type={importType}
        loanId={selectedLoan?.loan_id}
        onClose={() => setOpenImport(false)}
        onSuccess={handleImportSuccess}
      />

      <ConfirmationModal
        open={confirmDelete.open}
        onClose={() => {
          setConfirmDelete({ open: false, data: null });
          navigate('/loans');
        }}
        onConfirm={async () => {
          if (confirmDelete.data) {
            await deleteLoan(confirmDelete.data.loan_id);
            setConfirmDelete({ open: false, data: null });
            navigate('/loans');
          }
        }}
        title="Delete Loan"
        message={`Are you sure you want to delete loan #${confirmDelete.data?.loan_id}? This action cannot be undone.`}
        confirmText="Delete Loan"
        variant="danger"
      />
    </div>
  );
};

export default LoansPage;
