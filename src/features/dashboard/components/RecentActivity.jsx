import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  ChevronRight,
  Users2,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { useLoanContext } from '../../../context/LoanContext';
import { formatDate } from '../../../utils/dateUtils';
import '../dashboard.css';
import ActivityModal from '../modals/ActivityModal';
import HistoryModal from '../modals/HistoryModal';

const RecentActivity = () => {
  const { dashboardData } = useLoanContext();
  const recentActivities = dashboardData?.activities || [];
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [openHistory, setOpenHistory] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  const getActivityConfig = (item) => {
    switch (item.type?.toUpperCase()) {
      case 'PAYMENT':
        return {
          icon: <ArrowDownLeft size={18} strokeWidth={2.5} />,
          color: '#10b981', // Emerald
          bg: '#ecfdf5',
          label: 'Payment Received',
          amountSign: '+',
          amountColor: '#059669',
        };
      case 'LOAN':
        return {
          icon: <ArrowUpRight size={18} strokeWidth={2.5} />,
          color: '#3b82f6', // Blue
          bg: '#eff6ff',
          label: 'Loan Disbursed',
          amountSign: '',
          amountColor: '#1e293b',
        };
      case 'TOPUP':
        return {
          icon: <ArrowUpRight size={18} strokeWidth={2.5} />,
          color: '#3b82f6',
          bg: '#eff6ff',
          label: 'Top-up Added',
          amountSign: '+',
          amountColor: '#1e293b',
        };
      case 'PENALTY':
        return {
          icon: <AlertTriangle size={18} strokeWidth={2.5} />,
          color: '#ef4444', // Red
          bg: '#fef2f2',
          label: 'Penalty Applied',
          amountSign: '+',
          amountColor: '#b91c1c',
        };
      case 'BORROWER':
        return {
          icon: <Users2 size={18} strokeWidth={2.5} />,
          color: '#6366f1', // Indigo
          bg: '#eef2ff',
          label: 'New Member',
          amountSign: '',
          amountColor: '#4338ca',
        };
      default:
        return {
          icon: <Banknote size={18} strokeWidth={2.5} />,
          color: '#64748b',
          bg: '#f1f5f9',
          label: 'Transaction',
          amountSign: '',
          amountColor: '#334155',
        };
    }
  };

  return (
    <div className="recent-activity-card">
      <div className="recent-header">
        <div className="chunk-header">
          <h3>Recent Activity</h3>
          <p className="chunk-sub">Latest financial movements</p>
        </div>
        <button className="view-all-btn" onClick={() => setOpenHistory(true)}>
          View All
        </button>
      </div>

      <div className="recent-list">
        {recentActivities.length > 0 ? (
          recentActivities.map((item) => {
            const config = getActivityConfig(item);
            return (
              <div key={item.id} className="recent-item" onClick={() => setSelectedActivity(item)}>
                <div className="recent-left">
                  <div
                    className="activity-icon-box"
                    style={{
                      backgroundColor: config.bg,
                      color: config.color,
                      boxShadow: `0 4px 10px -2px ${config.color}30`,
                    }}
                  >
                    {config.icon}
                  </div>
                  <div className="recent-info">
                    <p className="recent-title">{item.description}</p>
                    <div className="recent-meta-row">
                      <span
                        className="meta-badge"
                        style={{ color: config.color, borderColor: `${config.color}30` }}
                      >
                        {config.label}
                      </span>
                      <span className="meta-dot">•</span>
                      <span className="meta-time">
                        {formatDate(item.time)} ·{' '}
                        {new Date(item.time).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="recent-right">
                  <p className="recent-amount" style={{ color: config.amountColor }}>
                    {item.type === 'BORROWER' && !item.amount ? (
                      <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#94a3b8' }}>
                        N/A
                      </span>
                    ) : (
                      <>
                        {config.amountSign}
                        {formatCurrency(item.amount)}
                      </>
                    )}
                  </p>
                  <div className="chevron-icon">
                    <ChevronRight size={16} color="var(--text-muted)" />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <Wallet size={48} strokeWidth={1} style={{ opacity: 0.2, marginBottom: '12px' }} />
            <p>No recent activity yet</p>
          </div>
        )}
      </div>

      <ActivityModal
        isOpen={!!selectedActivity}
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />

      <HistoryModal open={openHistory} onClose={() => setOpenHistory(false)} />
    </div>
  );
};

export default RecentActivity;
