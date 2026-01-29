import { Calendar, Download, Filter } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import API from '../../utils/api';
import { formatDate } from '../../utils/dateUtils';
import './reports.css';

const ReportsPage = () => {
  // Default to current month
  const getFirstDayOfMonth = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  };
  const getCurrentDate = () => new Date().toISOString().split('T')[0];

  const [filters, setFilters] = useState({
    startDate: getFirstDayOfMonth(),
    endDate: getCurrentDate(),
    type: 'ALL',
  });

  const [stats, setStats] = useState({
    disbursed: 0,
    collected: 0,
    penalties: 0,
    counts: { loans: 0, payments: 0, penalties: 0 },
  });

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [filters]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Parallel fetch
      const [statsRes, transRes] = await Promise.all([
        API.get(`/reports/stats`, { params: filters }),
        API.get(`/reports/transactions`, { params: filters }),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (transRes.data.success) setTransactions(transRes.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await API.get('/reports/export', {
        params: filters,
        responseType: 'blob',
      });

      // Download Trigger
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${filters.startDate}_${filters.endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded successfully');
    } catch (err) {
      console.error(err);
      toast.error('Export failed');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="reports-page">
      <Toaster position="top-right" />

      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">📊 Reports & Analytics</h2>
          <p className="page-subtitle">Track financial performance and transaction history</p>
        </div>
        <div className="page-header-right">{/* Actions if needed */}</div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <span className="stat-title">Total Disbursed</span>
          <span className="stat-value">₹{stats.disbursed.toLocaleString()}</span>
          <span className="stat-sub">{stats.counts.loans} Loans Issued</span>
        </div>
        <div className="stat-card green">
          <span className="stat-title">Total Collected</span>
          <span className="stat-value">₹{stats.collected.toLocaleString()}</span>
          <span className="stat-sub">{stats.counts.payments} Payments Received</span>
        </div>
        <div className="stat-card purple">
          <span className="stat-title">Penalties Applied</span>
          <span className="stat-value">₹{stats.penalties.toLocaleString()}</span>
          <span className="stat-sub">{stats.counts.penalties} Penalties Recorded</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="reports-filter-bar">
        <div className="filter-group">
          <Calendar size={26} strokeWidth={2.2} color="var(--text-muted)" />
          <span className="filter-label">Range:</span>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="filter-input"
          />
          <span style={{ color: 'var(--text-muted)', margin: '0 8px', fontWeight: '500' }}>to</span>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="filter-input"
          />
        </div>

        <div className="filter-group" style={{ marginLeft: '16px' }}>
          <Filter size={22} color="var(--text-muted)" />
          <span className="filter-label">Type:</span>
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="ALL">All Transactions</option>
            <option value="LOAN">Loans</option>
            <option value="PAYMENT">Payments</option>
            <option value="PENALTY">Penalties</option>
          </select>
        </div>

        <div className="filter-actions">
          <button
            className="export-btn"
            onClick={handleExport}
            disabled={loading || transactions.length === 0}
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="reports-table-container">
        <table className="reports-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Type</th>
              <th>Status</th>
              <th>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center p-4">
                  Loading data...
                </td>
              </tr>
            ) : transactions.length > 0 ? (
              transactions.map((t) => (
                <tr key={`${t.type}-${t.id}`}>
                  <td>{formatDate(t.date)}</td>
                  <td>{t.description}</td>
                  <td>
                    <span className={`type-badge ${t.type}`}>{t.type}</span>
                  </td>
                  <td>
                    <span
                      style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)' }}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: '600' }}>
                    {t.type === 'LOAN' ? '-' : '+'}₹{Number(t.amount).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">
                  <div className="empty-state">No transactions found for the selected range.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsPage;
