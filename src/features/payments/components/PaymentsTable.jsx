import { useNavigate } from 'react-router-dom';
import Table from '../../../common/table/Table';
import { useLoanContext } from '../../../context/LoanContext';
import { formatDate } from '../../../utils/dateUtils';

const PaymentsTable = ({ data = [] }) => {
  const { paymentsLoading } = useLoanContext();
  const navigate = useNavigate();

  const columns = [
    { key: 'sr', label: 'Sr No', render: (_, i) => i + 1 },
    {
      key: 'payment_date',
      label: 'Date',
      render: (row) => formatDate(row.payment_date),
    },
    {
      key: 'borrower',
      label: 'Borrower Name',
      // Standard text color, pointer cursor for link
      render: (row) => (
        <span
          className="link-text"
          onClick={() => navigate(`/borrowers/view/${row.borrower_id}`)}
          style={{ cursor: 'pointer' }}
        >
          {row.borrower_name}
        </span>
      ),
    },
    {
      key: 'loan_id',
      label: 'Loan ID',
      render: (row) => (
        <span
          className="link-text"
          onClick={() => navigate(`/loans/view/${row.loan_id}`)}
          style={{ cursor: 'pointer' }}
        >
          {row.loan_id}
        </span>
      ),
    },
    {
      key: 'payment_amount',
      label: 'Amount',
      // Match LoansTable: no bold, standard text color (which is usually inherited)
      render: (row) => `₹${Number(row.payment_amount).toLocaleString()}`,
    },
    {
      key: 'payment_for',
      label: 'Payment For',
      render: (row) => {
        const type = row.payment_for?.toLowerCase() || 'emi';
        return <span className={`status-badge ${type}`}>{row.payment_for || 'EMI'}</span>;
      },
    },
    {
      key: 'payment_mode',
      label: 'Method',
      render: (row) => {
        const mode = row.payment_mode?.toLowerCase() || 'cash';
        return <span className={`status-badge ${mode}`}>{row.payment_mode || 'Cash'}</span>;
      },
    },
    {
      key: 'remarks',
      label: 'Remarks',
      render: (row) => (
        <span style={{ color: '#64748b', fontSize: '13px' }}>{row.remarks || '-'}</span>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={data}
      loading={paymentsLoading}
      variant="purple"
      keyField="payment_id"
    />
  );
};

export default PaymentsTable;
