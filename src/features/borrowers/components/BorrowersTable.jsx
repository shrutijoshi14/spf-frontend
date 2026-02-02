import Table from '../../../common/table/Table';
import TableActions from '../../../common/table/TableActions';
import { useLoanContext } from '../../../context/LoanContext';

const BorrowersTable = ({ onView, onEdit, onDelete }) => {
  const { borrowers, loans, borrowersLoading } = useLoanContext();

  const columns = [
    { key: 'sr', label: 'Sr No', render: (_, i) => i + 1 },
    { key: 'full_name', label: 'Full Name' },
    {
      key: 'total_loans',
      label: 'Total',
      render: (row) => loans.filter((l) => l.borrower_id === row.borrower_id).length,
    },
    {
      key: 'active_loans',
      label: 'Active',
      render: (row) =>
        loans.filter(
          (l) => l.borrower_id === row.borrower_id && l.status.toUpperCase() === 'ACTIVE'
        ).length,
    },
    {
      key: 'closed_loans',
      label: 'Closed',
      render: (row) =>
        loans.filter(
          (l) => l.borrower_id === row.borrower_id && l.status.toUpperCase() === 'CLOSED'
        ).length,
    },
    { key: 'mobile', label: 'Mobile' },
    { key: 'email', label: 'Email' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => {
        const handleWhatsApp = (borrower) => {
          const mobile = borrower.mobile || '';
          const message = `Hello ${borrower.full_name},\n\nHope you are doing well. This is regarding your loan account at SPF Loans.\n\n- Regards, Admin`;
          const cleanMobile = mobile.replace(/\D/g, '');
          const url = `https://wa.me/${cleanMobile}?text=${encodeURIComponent(message)}`;
          window.open(url, '_blank');
        };

        return (
          <TableActions
            onView={() => onView(row)}
            onEdit={onEdit ? () => onEdit(row) : undefined}
            onWhatsApp={handleWhatsApp}
            onDelete={onDelete ? () => onDelete(row) : undefined}
            hidePay
          />
        );
      },
    },
  ];

  return (
    <Table columns={columns} data={borrowers} loading={borrowersLoading} keyField="borrower_id" />
  );
};

export default BorrowersTable;
