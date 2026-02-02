import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Search,
  Users2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Modal from '../../../common/Modal';
import '../../../common/table.css';
import '../../../styles/modal.css';
import API from '../../../utils/api';
import { formatDateTime } from '../../../utils/dateUtils';

const HistoryModal = ({ open, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/dashboard/history`, {
        params: { page, limit, search },
      });
      if (res.data.success) {
        setHistory(res.data.data.history);
        setTotalPages(res.data.data.totalPages);
        setTotalRecords(res.data.data.total); // Assuming backend sends total count
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchHistory();
    }
  }, [open, page, limit]); // Re-fetch when page or limit changes

  // Debounced search
  useEffect(() => {
    if (!open) return;
    const delayDebounce = setTimeout(() => {
      setPage(1);
      fetchHistory();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  // Helper to generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-header sticky-header">
        <h3>📜 Transaction History</h3>
        <button className="modal-close" onClick={onClose}>
          <span>×</span>
        </button>
      </div>

      <div
        className="modal-body-scroll"
        style={{
          padding: '0',
          display: 'flex',
          flexDirection: 'column',
          flex: '1',
          minHeight: '0',
          overflow: 'auto', // Handle BOTH X and Y scrolling on the body
        }}
      >
        <div
          style={{
            padding: '16px 24px',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-main)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            flexShrink: 0,
            position: 'sticky', // Optional: if we wanted it sticky, but user said NO.
            left: 0, // Ensure it aligns left on horizontal scroll
            width: 'fit-content', // Allow it to expand
            minWidth: '100%', // But at least full width
          }}
        >
          <div className="loans-search-row" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
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
              placeholder="Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="loans-search-input"
              style={{
                background: 'var(--input-bg)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-main)',
              }}
            />
          </div>

          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="form-select"
            style={{
              width: 'auto',
              padding: '10px 32px 10px 12px',
              background: 'var(--input-bg)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-main)',
            }}
          >
            <option value={10}>10 rows</option>
            <option value={20}>20 rows</option>
            <option value={50}>50 rows</option>
            <option value={100}>100 rows</option>
          </select>
        </div>

        <div
          className="table-wrapper"
          style={{
            boxShadow: 'none',
            borderRadius: 0,
            overflow: 'visible', // Let parent handle scroll
            border: 'none',
          }}
        >
          <table className="app-table">
            <thead style={{ background: 'var(--bg-secondary)' }}>
              <tr>
                <th style={{ paddingLeft: '24px', color: 'var(--text-main)' }}>Date</th>
                <th style={{ color: 'var(--text-main)' }}>Type</th>
                <th style={{ color: 'var(--text-main)' }}>Description</th>
                <th style={{ paddingRight: '24px', color: 'var(--text-main)' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ padding: '40px', textAlign: 'center' }}>
                    Loading...
                  </td>
                </tr>
              ) : history.length > 0 ? (
                history.map((item) => (
                  <tr key={`${item.type}-${item.id}`}>
                    <td style={{ paddingLeft: '24px', whiteSpace: 'nowrap' }}>
                      {formatDateTime(item.date)}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          item.type === 'LOAN'
                            ? 'active'
                            : item.type === 'PENALTY'
                              ? 'overdue'
                              : item.type === 'BORROWER'
                                ? 'interest'
                                : 'interest'
                        }`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color:
                            item.type === 'PENALTY'
                              ? '#ef4444'
                              : item.type === 'BORROWER'
                                ? '#4f46e5'
                                : undefined,
                          borderColor:
                            item.type === 'PENALTY'
                              ? 'rgba(239, 68, 68, 0.3)'
                              : item.type === 'BORROWER'
                                ? 'rgba(79, 70, 229, 0.3)'
                                : undefined,
                          background:
                            item.type === 'PENALTY'
                              ? 'rgba(239, 68, 68, 0.1)'
                              : item.type === 'BORROWER'
                                ? 'rgba(79, 70, 229, 0.1)'
                                : undefined,
                        }}
                      >
                        {item.type === 'LOAN' || item.type === 'TOPUP' ? (
                          <ArrowUpRight size={14} />
                        ) : item.type === 'PENALTY' ? (
                          <AlertTriangle size={14} />
                        ) : item.type === 'BORROWER' ? (
                          <Users2 size={14} />
                        ) : (
                          <ArrowDownLeft size={14} />
                        )}
                        {item.type}
                      </span>
                    </td>
                    <td style={{ textAlign: 'left', fontWeight: '500' }}>{item.description}</td>
                    <td
                      style={{
                        paddingRight: '24px',
                        fontWeight: '700',
                        color:
                          item.type === 'LOAN' || item.type === 'TOPUP'
                            ? '#2563eb' // Sharper Blue
                            : item.type === 'PAYMENT'
                              ? '#10b981' // Green
                              : item.type === 'PENALTY'
                                ? '#ef4444' // Red
                                : '#64748b', // Grey
                      }}
                    >
                      {item.type === 'BORROWER' && !item.amount ? (
                        <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>N/A</span>
                      ) : (
                        <span style={{ color: item.type === 'PAYMENT' ? '#10b981' : undefined }}>
                          {item.type === 'PAYMENT' ? '− ' : '+ '}
                          {formatCurrency(item.amount)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}
                  >
                    No history found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className="modal-footer sticky-footer"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Showing <strong>{(page - 1) * limit + 1}</strong> to{' '}
          <strong>{Math.min(page * limit, totalRecords || page * limit)}</strong> of{' '}
          <strong>{totalRecords || 'many'}</strong>
        </span>

        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="view-btn icon-btn"
            style={{ opacity: page === 1 ? 0.5 : 1, padding: '8px' }}
          >
            <ChevronLeft size={16} />
          </button>

          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setPage(pageNum)}
              className={`view-btn ${pageNum === page ? 'active-page' : ''}`}
              style={{
                minWidth: '32px',
                background: pageNum === page ? 'var(--accent)' : 'var(--bg-secondary)',
                color: pageNum === page ? 'white' : 'var(--text-main)',
                padding: '8px 10px',
              }}
            >
              {pageNum}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="view-btn icon-btn"
            style={{ opacity: page === totalPages ? 0.5 : 1, padding: '8px' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default HistoryModal;
