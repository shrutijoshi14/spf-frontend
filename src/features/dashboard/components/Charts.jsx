import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useLoanContext } from '../../../context/LoanContext';
import { useTheme } from '../../../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const ChartPlaceholder = ({ icon: Icon, message }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: 'var(--text-muted)',
      gap: '12px',
      opacity: 0.7,
    }}
  >
    <div
      style={{
        width: '56px',
        height: '56px',
        background: 'var(--bg-app)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={24} className="text-muted" style={{ opacity: 0.6 }} />
    </div>
    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
  </div>
);

const Charts = () => {
  const { theme } = useTheme();
  const { dashboardData } = useLoanContext();
  const charts = dashboardData?.charts || {};
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Force re-render on resize to fix chart scaling issues
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDark = theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? '#334155' : '#f1f5f9';

  // Premium Theme Colors - Meaningful & Standard
  const mainColor = '#2563eb'; // Blue-600 (Primary Brand)
  const mainColorLight = 'rgba(37, 99, 235, 0.85)';

  // Meaningful Status Colors: Active (Blue), Closed (Green), Overdue (Red), Pending (Slate)
  const colors = ['#3b82f6', '#10b981', '#ef4444', '#64748b'];

  // Create labels with counts for Doughnut (e.g., "Active - 2")
  const pieLabels =
    charts.pie?.labels?.map((label, index) => {
      const count = charts.pie?.data?.[index] || 0;
      // Prevent double appending if label already has count
      if (String(label).includes(' - ')) return label;
      return `${label} - ${count}`;
    }) || [];

  // 0. Common Options (Must be defined first)
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            family: "'Inter', system-ui, sans-serif",
            size: 12,
            weight: 500,
          },
          color: textColor,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { family: "'Inter', system-ui, sans-serif", size: 14, weight: 600 },
        bodyFont: { family: "'Inter', system-ui, sans-serif", size: 13 },
        padding: 12,
        cornerRadius: 10,
        displayColors: false,
        callbacks: {
          // Clean up tooltip label if needed (optional)
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
  };

  // Helper to generate distinct vibrant colors
  const vibrantColors = [
    '#2563eb',
    '#16a34a',
    '#dc2626',
    '#d97706',
    '#9333ea',
    '#db2777',
    '#0891b2',
    '#4f46e5',
    '#ca8a04',
    '#059669',
    '#be123c',
    '#7c3aed',
    '#0284c7',
    '#65a30d',
    '#e11d48',
    '#57534e',
    '#0d9488',
    '#b45309',
    '#4b5563',
    '#1e40af',
  ];

  const getVibrantColor = (index) => vibrantColors[index % vibrantColors.length];

  // Helper to convert Hex to RGBA for light backgrounds
  const hexToRgba = (hex, alpha = 0.2) => {
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split('');
      if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = '0x' + c.join('');
      return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
    }
    return hex;
  };

  // 1. Monthly Interest by Borrower (Top 5)
  const interestData = {
    labels: charts.interestByBorrower?.labels || [],
    datasets: [
      {
        label: 'Monthly Interest',
        data: charts.interestByBorrower?.data || [],
        // Light Background
        backgroundColor:
          charts.interestByBorrower?.data?.map((_, i) => hexToRgba(getVibrantColor(i), 0.2)) ||
          '#2563eb',
        // Dark Border
        borderColor:
          charts.interestByBorrower?.data?.map((_, i) => getVibrantColor(i)) || '#2563eb',
        borderWidth: 2,
        borderRadius: 4,
        maxBarThickness: 40,
        hoverBackgroundColor: charts.interestByBorrower?.data?.map((_, i) =>
          hexToRgba(getVibrantColor(i), 0.4)
        ), // Slightly darker on hover
      },
    ],
  };

  const interestOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      legend: { display: false }, // No legend needed for single series
      tooltip: {
        ...commonOptions.plugins.tooltip,
        callbacks: {
          label: (context) => {
            return new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0,
            }).format(context.parsed.y);
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: textColor,
          font: { family: "'Inter', system-ui, sans-serif" },
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: gridColor },
        ticks: {
          color: textColor,
          font: { family: "'Inter', system-ui, sans-serif" },
        },
      },
    },
  };

  // 2. Loan Status (Doughnut) - Kept as is
  const doughnutData = {
    labels: pieLabels,
    datasets: [
      {
        data: charts.pie?.data || [],
        // Light Background
        backgroundColor: colors.map((c) => hexToRgba(c, 0.2)),
        // Dark Border
        borderColor: colors,
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  // 3. Payment Performance (Top 5) - Green/Red Bars
  const paymentPerformanceData = {
    labels: charts.paymentPerformance?.labels || [],
    datasets: [
      {
        label: 'Total Paid',
        data: charts.paymentPerformance?.data || [],
        // Light Background based on status color
        backgroundColor:
          charts.paymentPerformance?.colors?.map((c) => hexToRgba(c, 0.2)) || '#10b981',
        // Dark Border based on status color
        borderColor: charts.paymentPerformance?.colors || '#10b981',
        borderWidth: 2,
        borderRadius: 4,
        maxBarThickness: 40,
        hoverBackgroundColor: charts.paymentPerformance?.colors?.map((c) => hexToRgba(c, 0.4)), // Slightly darker on hover
      },
    ],
  };

  // Specific tooltip for Pie to handle new labels or just show value
  const doughnutOptions = {
    ...commonOptions,
    cutout: '75%',
    plugins: {
      ...commonOptions.plugins,
      tooltip: {
        ...commonOptions.plugins.tooltip,
        callbacks: {
          title: function (tooltipItems) {
            // Also strip the suffix from the tooltip header/title
            if (tooltipItems.length > 0) {
              const label = tooltipItems[0].label || '';
              return label.replace(/\s-\s\d+$/, '');
            }
            return '';
          },
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            // Robustly strip the " - <number>" suffix we added for the legend
            const cleanLabel = label.replace(/\s-\s\d+$/, '');
            return `${cleanLabel}: ${value}`;
          },
        },
      },
    },
  };

  return (
    <div className="charts-grid">
      {/* 1. Monthly Interest by Borrower */}
      <div
        className="chart-card span-full"
        style={{ border: '1px solid var(--border-main)', background: 'var(--bg-surface)' }}
      >
        <h3 style={{ color: 'var(--text-main)' }}>📊 Monthly Interest by Borrower</h3>
        <div style={{ position: 'relative', flex: 1, width: '100%', minHeight: 0 }}>
          {interestData.datasets[0].data.length > 0 &&
          interestData.datasets[0].data.some((v) => v > 0) ? (
            <Bar data={interestData} options={interestOptions} key={windowWidth} />
          ) : (
            <ChartPlaceholder icon={BarChart3} message="No interest data available" />
          )}
        </div>
      </div>

      {/* 2. Loan Status Distribution */}
      <div
        className="chart-card"
        style={{ border: '1px solid var(--border-main)', background: 'var(--bg-surface)' }}
      >
        <h3 style={{ color: 'var(--text-main)' }}>🥧 Loan Status Distribution</h3>
        <div
          style={{
            position: 'relative',
            flex: 1,
            width: '100%',
            minHeight: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {doughnutData.datasets[0].data.length > 0 &&
          doughnutData.datasets[0].data.some((v) => v > 0) ? (
            <Doughnut data={doughnutData} options={doughnutOptions} key={windowWidth} />
          ) : (
            <ChartPlaceholder icon={PieChart} message="No Loan Status Data" />
          )}
        </div>
      </div>

      {/* 3. Payment Performance */}
      <div
        className="chart-card"
        style={{ border: '1px solid var(--border-main)', background: 'var(--bg-surface)' }}
      >
        <h3 style={{ color: 'var(--text-main)' }}>📈 Payment Performance</h3>
        <div style={{ position: 'relative', flex: 1, width: '100%', minHeight: 0 }}>
          {paymentPerformanceData.datasets[0].data.length > 0 &&
          paymentPerformanceData.datasets[0].data.some((v) => v > 0) ? (
            <Bar data={paymentPerformanceData} options={interestOptions} key={windowWidth} />
          ) : (
            <ChartPlaceholder icon={TrendingUp} message="No payment history yet" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Charts;
