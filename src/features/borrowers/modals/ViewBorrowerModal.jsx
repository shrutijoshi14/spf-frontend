import { BarChart3, Heart, History, MapPin, User, Users } from 'lucide-react';
import Button from '../../../common/Button';
import Modal from '../../../common/Modal';
import Table from '../../../common/table/Table';
import { useLoanContext } from '../../../context/LoanContext';
import '../../../styles/modal.css';
import { formatDate } from '../../../utils/dateUtils';
import './view-borrower-modal.css';

import { useState } from 'react';
// ... other imports

const ViewBorrowerModal = ({ open, borrower, onClose }) => {
  const { loans } = useLoanContext();
  const [activeTab, setActiveTab] = useState('personal');

  if (!open || !borrower) return null;

  // Filter & Sort loans (Newest First)
  const borrowerLoans = loans
    .filter((l) => l.borrower_id === borrower.borrower_id)
    .sort((a, b) => new Date(b.disbursement_date) - new Date(a.disbursement_date));

  // LOAN SUMMARY CONFIG
  const summaryColumns = [
    {
      key: 'total',
      label: 'Total Loans',
      render: (row) => (
        <div style={{ fontSize: '1.4rem', fontWeight: '700', padding: '12px 0' }}>{row.total}</div>
      ),
    },
    {
      key: 'active',
      label: 'Active Loans',
      render: (row) => (
        <div style={{ fontSize: '1.4rem', fontWeight: '700', padding: '12px 0', color: '#059669' }}>
          {row.active}
        </div>
      ),
    },
    {
      key: 'closed',
      label: 'Closed Loans',
      render: (row) => (
        <div style={{ fontSize: '1.4rem', fontWeight: '700', padding: '12px 0', color: '#475569' }}>
          {row.closed}
        </div>
      ),
    },
    {
      key: 'overdue',
      label: 'Pending Overdue',
      render: (row) => (
        <div style={{ fontSize: '1.4rem', fontWeight: '700', padding: '12px 0', color: '#e11d48' }}>
          {row.overdue}
        </div>
      ),
    },
  ];

  const summaryData = [
    {
      total: borrowerLoans.length,
      active: borrowerLoans.filter((l) => l.status.toUpperCase() === 'ACTIVE').length,
      closed: borrowerLoans.filter((l) => l.status.toUpperCase() === 'CLOSED').length,
      overdue: borrowerLoans.filter((l) => l.status.toUpperCase() === 'OVERDUE').length,
    },
  ];

  // LOAN HISTORY CONFIG
  const historyColumns = [
    {
      key: 'loan_id',
      label: 'Loan ID',
      render: (row) => <div style={{ padding: '8px 0' }}>#{row.loan_id}</div>,
    },
    {
      key: 'disbursement_date',
      label: 'Date',
      render: (row) => <div style={{ padding: '8px 0' }}>{formatDate(row.disbursement_date)}</div>,
    },
    {
      key: 'principal_amount',
      label: 'Principal',
      render: (row) => <div style={{ padding: '8px 0' }}>₹{row.principal_amount}</div>,
    },
    {
      key: 'interest',
      label: 'Interest (M)',
      render: (row) => {
        const principal = Number(row.principal_amount);
        const outstanding = Number(row.outstanding_amount);
        const rate = Number(row.interest_rate);

        // Calculation based on Interest Type
        const interestAmount =
          row.interest_type === 'REDUCING' ? (outstanding * rate) / 100 : (principal * rate) / 100;

        return <div style={{ padding: '8px 0' }}>₹{Math.round(interestAmount)}</div>;
      },
    },
    {
      key: 'total_penalty',
      label: 'Penalty',
      render: (row) => (
        <div
          style={{
            padding: '8px 0',
            color: row.total_penalty > 0 ? '#dc2626' : 'inherit',
            fontWeight: row.total_penalty > 0 ? '600' : '400',
          }}
        >
          ₹{row.total_penalty || 0}
        </div>
      ),
    },
    {
      key: 'outstanding_amount',
      label: 'Outstanding',
      render: (row) => (
        <div style={{ padding: '8px 0', fontWeight: '700' }}>₹{row.outstanding_amount}</div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <div style={{ padding: '8px 0' }}>
          <span className={`loan-status ${row.status.toLowerCase()}`}>{row.status}</span>
        </div>
      ),
    },
  ];

  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-header sticky-header">
        <h3>💰 {borrower.full_name}'s Details</h3>
        <button className="modal-close" onClick={onClose}>
          <span>×</span>
        </button>
      </div>

      <div className="modal-body-scroll">
        {/* TABS NAVIGATION */}
        <div
          style={{
            padding: '0 24px',
            marginBottom: '20px',
            borderBottom: '2px solid var(--border-main)',
          }}
        >
          <div style={{ display: 'flex', gap: '10px', paddingBottom: '10px' }}>
            <button
              style={{
                background: activeTab === 'personal' ? 'var(--nav-active)' : 'var(--bg-surface)',
                color: activeTab === 'personal' ? 'var(--nav-text-active)' : 'var(--text-muted)',
                border:
                  activeTab === 'personal'
                    ? '1px solid var(--accent)'
                    : '1px solid var(--border-main)',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: activeTab === 'personal' ? 'var(--shadow-main)' : 'none',
              }}
              onClick={() => setActiveTab('personal')}
            >
              Personal Details
            </button>
            <button
              style={{
                background: activeTab === 'status' ? 'var(--nav-active)' : 'var(--bg-surface)',
                color: activeTab === 'status' ? 'var(--nav-text-active)' : 'var(--text-muted)',
                border:
                  activeTab === 'status'
                    ? '1px solid var(--accent)'
                    : '1px solid var(--border-main)',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: activeTab === 'status' ? 'var(--shadow-main)' : 'none',
              }}
              onClick={() => setActiveTab('status')}
            >
              Loan Status
            </button>
            <button
              style={{
                background: activeTab === 'history' ? 'var(--nav-active)' : 'var(--bg-surface)',
                color: activeTab === 'history' ? 'var(--nav-text-active)' : 'var(--text-muted)',
                border:
                  activeTab === 'history'
                    ? '1px solid var(--accent)'
                    : '1px solid var(--border-main)',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: activeTab === 'history' ? 'var(--shadow-main)' : 'none',
              }}
              onClick={() => setActiveTab('history')}
            >
              Loan History
            </button>
          </div>
        </div>

        {/* TAB CONTENT */}
        {activeTab === 'personal' && (
          <div className="borrower-details-grid">
            {/* 1. PERSONAL DETAILS */}
            <div className="details-card personal">
              <div className="card-header">
                <div className="header-icon-bg">
                  <User size={18} />
                </div>
                <h4>Personal Info</h4>
              </div>
              <div className="data-table">
                <DataRow label="Full Name" value={borrower.full_name} />
                <DataRow label="Mobile" value={borrower.mobile} />
                <DataRow label="Alt Mobile" value={borrower.alternate_mobile} />
                <DataRow label="Email" value={borrower.email} />
                <DataRow label="Member Since" value={formatDate(borrower.created_at)} />
              </div>
            </div>

            {/* 2. ADDRESS DETAILS */}
            <div className="details-card address">
              <div className="card-header">
                <div className="header-icon-bg">
                  <MapPin size={18} />
                </div>
                <h4>Address</h4>
              </div>
              <div className="data-table">
                <DataRow label="Line 1" value={borrower.address_line1} />
                <DataRow label="Line 2" value={borrower.address_line2} />
                <DataRow label="City" value={borrower.city} />
                <DataRow label="State" value={borrower.state} />
                <DataRow label="Pincode" value={borrower.pincode} />
              </div>
            </div>

            {/* 3. GUARANTOR DETAILS */}
            <div className="details-card guarantor">
              <div className="card-header">
                <div className="header-icon-bg">
                  <Users size={18} />
                </div>
                <h4>Guarantor</h4>
              </div>
              <div className="data-table">
                <DataRow label="Name" value={borrower.guarantor_name} />
                <DataRow label="Phone" value={borrower.guarantor_phone} />
                <DataRow label="Address" value={borrower.guarantor_address} />
              </div>
            </div>

            {/* 4. RELATIVE DETAILS */}
            <div className="details-card relative">
              <div className="card-header">
                <div className="header-icon-bg">
                  <Heart size={18} />
                </div>
                <h4>Relative</h4>
              </div>
              <div className="data-table">
                <DataRow label="Name" value={borrower.relative_name} />
                <DataRow label="Phone" value={borrower.relative_phone} />
                <DataRow label="Relation" value={borrower.relation} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'status' && (
          <div style={{ padding: '0 10px 0 10px' }}>
            <div className="card-header" style={{ marginBottom: '12px', borderBottom: 'none' }}>
              <div className="header-icon-bg" style={{ background: '#ecfdf5', color: '#059669' }}>
                <BarChart3 size={18} />
              </div>
              <h4>Loan Status</h4>
            </div>
            <Table columns={summaryColumns} data={summaryData} variant="green" />
          </div>
        )}

        {activeTab === 'history' && (
          <div style={{ padding: '20px 10px 20px 10px' }}>
            <div className="card-header" style={{ marginBottom: '12px', borderBottom: 'none' }}>
              <div className="header-icon-bg" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <History size={18} />
              </div>
              <h4>Loan History</h4>
            </div>
            <Table columns={historyColumns} data={borrowerLoans} variant="blue" />
          </div>
        )}
      </div>

      <div className="sticky-footer">
        <Button text="Close" onClick={onClose} />
      </div>
    </Modal>
  );
};

const DataRow = ({ label, value }) => (
  <div className="data-row">
    <span className="data-label">{label}</span>
    <span className="data-value">{value || '-'}</span>
  </div>
);

export default ViewBorrowerModal;
