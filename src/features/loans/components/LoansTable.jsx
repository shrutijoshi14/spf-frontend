import Table from '../../../common/table/Table';
import TableActions from '../../../common/table/TableActions';
import { useLoanContext } from '../../../context/LoanContext';

const LoansTable = ({ loans: loansProp, onView, onPay, onTopup, onPenalty, onDelete }) => {
  const { loans: contextLoans, borrowers, loading } = useLoanContext();
  const loans = loansProp || contextLoans;

  const getBorrowerName = (borrowerId) =>
    borrowers.find((b) => b.borrower_id === borrowerId)?.full_name || '—';

  const columns = [
    { key: 'sr', label: 'Sr No', render: (_, i) => i + 1 },
    {
      key: 'borrower',
      label: 'Borrower Name',
      render: (row) => getBorrowerName(row.borrower_id),
    },
    { key: 'principal_amount', label: 'Principal' },
    { key: 'interest_rate', label: 'Interest Rate %' },
    {
      key: 'monthly_interest',
      label: 'Interest Amount (M)',
      render: (row) => `₹${Math.round((row.principal_amount * row.interest_rate) / 100)}`,
    },
    {
      key: 'penalty_paid',
      label: 'Penalty Paid',
      render: (row) => `₹${row.penalty_paid || 0}`,
    },
    { key: 'outstanding_amount', label: 'Outstanding Principal' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`loan-status ${row.status.toLowerCase()}`}>{row.status}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => {
        const handleWhatsApp = (loan) => {
          const monthlyInt = Math.round((loan.principal_amount * loan.interest_rate) / 100);
          const penalty = loan.total_penalty - loan.penalty_paid;
          const total = monthlyInt + penalty;
          const mobile = loan.mobile || '';

          const message = `Hello ${loan.full_name || 'Borrower'},\n\nYour loan payment (ID #${loan.loan_id}) is due.\nMonthly Interest: ₹${monthlyInt}\nPending Penalty: ₹${penalty}\nTotal Payable: ₹${total}\n\nPlease settle this to avoid further charges.\n\n- SPF Loans`;

          const cleanMobile = mobile.replace(/\D/g, '');
          const url = `https://wa.me/${cleanMobile}?text=${encodeURIComponent(message)}`;
          window.open(url, '_blank');
        };

        return (
          <TableActions
            row={row}
            onView={() => onView(row)}
            onPay={() => onPay(row)}
            onTopup={onTopup ? () => onTopup(row) : undefined}
            onPenalty={onPenalty ? () => onPenalty(row) : undefined}
            onWhatsApp={handleWhatsApp}
            onDelete={onDelete ? () => onDelete(row) : undefined}
            hideEdit
          />
        );
      },
    },
  ];

  return <Table columns={columns} data={loans} loading={loading} keyField="loan_id" />;
};

export default LoansTable;
