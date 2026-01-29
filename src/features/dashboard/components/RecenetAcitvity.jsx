import { useState } from 'react';
import '../dashboard.css';
import ActivityModal from '../modals/ActivityModal';

const RecentActivity = () => {
  const recentActivities = [
    {
      id: 1,
      title: 'New Loan Created',
      description: 'Loan added for Rahul Sharma',
      amount: '₹2,50,000',
      time: '2 mins ago',
      status: 'success',
    },
    {
      id: 2,
      title: 'EMI Received',
      description: 'EMI from Priya Patil',
      amount: '₹8,500',
      time: '1 hour ago',
      status: 'success',
    },
    {
      id: 3,
      title: 'Payment Pending',
      description: 'EMI overdue – Amit Verma',
      amount: '₹6,200',
      time: 'Yesterday',
      status: 'warning',
    },
  ];

  const [selectedActivity, setSelectedActivity] = useState(null);

  return (
    <div className="recent-activity-card">
      <div className="recent-header">
        <h3>Recent Activity</h3>
        <button className="view-all-btn">View All</button>
      </div>

      <div className="recent-list">
        {recentActivities.map((item) => (
          <div key={item.id} className="recent-item">
            {/* Status */}
            <div className={`status-dot ${item.status}`}></div>

            {/* Main info */}
            <div className="recent-info">
              <p className="recent-title">{item.title}</p>
              <p className="recent-desc">{item.description}</p>
            </div>

            {/* Right section */}
            <div className="recent-right">
              <div className="recent-meta">
                <p className="recent-amount">{item.amount}</p>
                <p className="recent-time">{item.time}</p>
              </div>

              <button className="view-btn" onClick={() => setSelectedActivity(item)}>
                View
              </button>
            </div>
          </div>
        ))}
      </div>
      <ActivityModal
        isOpen={!!selectedActivity}
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />
    </div>
  );
};

export default RecentActivity;
