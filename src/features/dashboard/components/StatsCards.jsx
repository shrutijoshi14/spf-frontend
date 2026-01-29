import {
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  Lock,
  Receipt,
  TrendingUp,
  Users2,
} from 'lucide-react';
import { useLoanContext } from '../../../context/LoanContext';

const getColorHex = (color) => {
  const colors = {
    blue: '#2563eb',
    indigo: '#4f46e5',
    green: '#16a34a',
    purple: '#9333ea',
    orange: '#ea580c',
    red: '#dc2626',
    teal: '#0d9488',
  };
  return colors[color] || '#0f172a';
};

const StatsCards = () => {
  const { dashboardData } = useLoanContext();
  const stats = dashboardData?.stats || {};

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString('en-IN', {
      maximumFractionDigits: 0,
    });
  };

  const cards = [
    {
      title: 'Total Loans',
      value: `₹ ${formatCurrency(stats.totalLoans)}`,
      icon: <CircleDollarSign size={24} />,
      color: 'blue',
    },
    {
      title: 'Total Borrowers',
      value: stats.totalBorrowers || 0,
      icon: <Users2 size={24} />,
      color: 'indigo',
    },
    {
      title: 'Active Loans',
      value: stats.activeLoans || 0,
      icon: <CheckCircle2 size={24} />,
      color: 'green',
    },
    {
      title: 'Closed Loans',
      value: stats.closedLoans || 0,
      icon: <Lock size={24} />,
      color: 'purple',
    },
    {
      title: 'Total Payments',
      value: `₹ ${formatCurrency(stats.totalPayments)}`,
      icon: <Receipt size={24} />,
      color: 'orange',
    },
    {
      title: 'Pending Dues',
      value: `₹ ${formatCurrency(stats.pendingDues)}`,
      icon: <AlertTriangle size={24} />,
      color: 'red',
    },
    {
      title: 'Monthly Interest',
      value: `₹ ${formatCurrency(stats.monthlyInterest)}`,
      icon: <TrendingUp size={24} />,
      color: 'teal',
    },
    {
      title: 'Total Penalties',
      value: `₹ ${formatCurrency(stats.totalPenalties)}`,
      icon: <AlertTriangle size={24} />,
      color: 'red',
    },
    {
      title: "Today's Penalties",
      value: `₹ ${formatCurrency(stats.todayPenalties)}`,
      icon: <AlertTriangle size={24} />,
      color: 'orange',
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((item, i) => (
        <div className={`stat-card ${item.color}`} key={i}>
          <div className="stat-icon-wrapper">{item.icon}</div>
          <div className="stat-text">
            <p>{item.title}</p>
            <h3 style={{ color: getColorHex(item.color) }}>{item.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
