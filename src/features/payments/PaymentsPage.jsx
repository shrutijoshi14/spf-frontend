import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLoanContext } from '../../context/LoanContext';
import '../dashboard/dashboard.css';
import PaymentsTable from './components/PaymentsTable';

const PaymentsPage = () => {
  const { payments, fetchPayments } = useLoanContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchPayments({ showLoading: payments.length === 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPayments]);

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.borrower_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(p.loan_id).includes(searchTerm);

    const matchesFilter =
      filterType === 'all' || p.payment_for?.toUpperCase() === filterType.toUpperCase();

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-text">
          <h1 className="dashboard-title">💸 Payments History</h1>
          <p className="dashboard-subtitle">
            View and track all payments across all active and closed loans.
          </p>
        </div>
      </div>

      <div
        className="actions-bar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div
          className="search-box"
          style={{
            position: 'relative',
            flex: '1',
            minWidth: '300px',
          }}
        >
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }}
          />
          <input
            type="text"
            placeholder="Search by borrower name or loan ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 44px',
              borderRadius: '12px',
              border: '1px solid var(--border-main)',
              fontSize: '14px',
              outline: 'none',
              transition: 'var(--transition)',
              background: 'var(--input-bg)',
              color: 'var(--text-main)',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-main)')}
          />
        </div>

        <div className="filter-group" style={{ display: 'flex', gap: '8px' }}>
          {['all', 'emi', 'penalty', 'interest'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: '1px solid',
                borderColor: filterType === type ? 'var(--accent)' : 'var(--border-main)',
                background: filterType === type ? 'var(--nav-active)' : 'var(--bg-surface)',
                color: filterType === type ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'var(--transition)',
                textTransform: 'capitalize',
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <PaymentsTable data={filteredPayments} />
    </div>
  );
};

export default PaymentsPage;
