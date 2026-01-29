import '../loans-summary.css';
import '../loans.css';

const LoanSummary = ({ borrowers }) => {
  const totalBorrowers = borrowers.length;
  const activeLoans = borrowers.reduce((a, b) => a + b.activeLoans, 0);
  const closedLoans = borrowers.reduce((a, b) => a + b.closedLoans, 0);
  const totalPending = borrowers.reduce((a, b) => a + b.pendingAmount, 0);

  return (
    <div className="loan-summary">
      <div className="summary-card gradient-purple">
        <div className="card-icon">👥</div>
        <h4>Total Borrowers</h4>
        <h2>{totalBorrowers}</h2>
      </div>

      <div className="summary-card gradient-green">
        <div className="card-icon">💸</div>
        <h4>Active Loans</h4>
        <h2>{activeLoans}</h2>
      </div>

      <div className="summary-card gradient-gray">
        <div className="card-icon">✅</div>
        <h4>Closed Loans</h4>
        <h2>{closedLoans}</h2>
      </div>

      <div className="summary-card gradient-orange">
        <div className="card-icon">⏳</div>
        <h4>Pending Amount</h4>
        <h2>₹ {totalPending.toLocaleString()}</h2>
      </div>
    </div>
  );
};

export default LoanSummary;
