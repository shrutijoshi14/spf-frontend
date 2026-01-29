import { AlertTriangle, Calendar, Clock } from 'lucide-react';
import { useLoanContext } from '../../../context/LoanContext';
import { formatDate } from '../../../utils/dateUtils';
import '../dashboard.css';

const UpcomingDues = () => {
  const { dashboardData } = useLoanContext();
  const upcomingDues = dashboardData?.upcoming || [];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  return (
    <div className="recent-activity-card">
      <div className="recent-header">
        <div className="chunk-header">
          <h3>Upcoming Dues</h3>
          <p className="chunk-sub">Payments due within 7 days</p>
        </div>
      </div>

      <div className="recent-list">
        {upcomingDues.length > 0 ? (
          upcomingDues.map((item) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize today
            const dueDate = new Date(item.date);
            dueDate.setHours(0, 0, 0, 0); // Normalize due date

            const diffTime = dueDate - today;
            const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Risk Logic
            const isHighRisk = daysLeft <= 3 && daysLeft >= 0;
            const isOverdue = daysLeft < 0;

            let statusText = `Due in ${daysLeft} days`;
            if (daysLeft === 0) statusText = 'Due Today';
            if (daysLeft === 1) statusText = 'Due Tomorrow';
            if (isOverdue) statusText = 'Overdue!';

            return (
              <div key={item.id} className="recent-item">
                <div className="recent-left">
                  <div
                    className="activity-icon-box"
                    style={{
                      backgroundColor:
                        isHighRisk || isOverdue
                          ? 'rgba(239, 68, 68, 0.1)'
                          : 'rgba(249, 115, 22, 0.1)',
                      color: isHighRisk || isOverdue ? '#ef4444' : '#f97316',
                    }}
                  >
                    {isHighRisk || isOverdue ? (
                      <AlertTriangle size={18} strokeWidth={2.5} />
                    ) : (
                      <Clock size={18} strokeWidth={2.5} />
                    )}
                  </div>
                  <div className="recent-info">
                    <p className="recent-title">{item.name}</p>
                    <div className="recent-meta-row">
                      <span className="recent-desc">Due {formatDate(item.date)}</span>
                      {(isHighRisk || isOverdue) && (
                        <>
                          <span className="meta-dot" style={{ margin: '0 4px' }}>
                            •
                          </span>
                          <span
                            className="meta-badge"
                            style={{
                              color: '#ef4444',
                              borderColor: 'rgba(239, 68, 68, 0.3)',
                              background: 'rgba(239, 68, 68, 0.1)',
                              fontSize: '10px',
                            }}
                          >
                            ⚠ Penalty Risk
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className="recent-right"
                  style={{ flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}
                >
                  <p className="recent-amount" style={{ color: isOverdue ? '#ef4444' : '#f97316' }}>
                    {formatCurrency(item.amount)}
                  </p>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: isHighRisk || isOverdue ? '#ef4444' : '#f97316',
                    }}
                  >
                    {statusText}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <Calendar size={48} strokeWidth={1} style={{ opacity: 0.2, marginBottom: '12px' }} />
            <p>No upcoming payments due soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingDues;
