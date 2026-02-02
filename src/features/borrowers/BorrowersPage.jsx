import { Download, Search, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../common/Button';
import ConfirmationModal from '../../common/ConfirmationModal';
import { useAuth } from '../../context/AuthContext';
import { useLoanContext } from '../../context/LoanContext';
import BorrowersTable from './components/BorrowersTable';
import AddBorrowerModal from './modals/AddBorrowerModal';
import EditBorrowerModal from './modals/EditBorrowerModal';
import ViewBorrowerModal from './modals/ViewBorrowerModal';

const BorrowersPage = ({ initialModal }) => {
  const { borrowers, addBorrower, updateBorrower, deleteBorrower, borrowersLoading } =
    useLoanContext();
  const { hasPermission } = useAuth();

  const navigate = useNavigate();
  const { borrowerId } = useParams();

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmModal, setConfirmModal] = useState({ open: false, data: null });

  // Sync state with URL
  useEffect(() => {
    if (borrowerId && borrowers.length > 0) {
      const borrower = borrowers.find((b) => String(b.borrower_id) === String(borrowerId));
      if (borrower) {
        setSelectedBorrower(borrower); // Common for View/Edit/Delete

        if (initialModal === 'edit-borrower') {
          setOpenEditModal(true);
        } else if (initialModal === 'delete-borrower') {
          setConfirmModal({ open: true, data: borrower });
        } else {
          // Default to View
          setOpenViewModal(true);
        }
      }
    } else {
      setOpenViewModal(false);
      setOpenEditModal(false);
      setConfirmModal({ open: false, data: null });
    }
  }, [borrowerId, borrowers, initialModal]);

  // Handle Add (No ID)
  useEffect(() => {
    if (initialModal === 'add-borrower') {
      setOpenAddModal(true);
    }
  }, [initialModal]);

  const filteredBorrowers = borrowers.filter(
    (b) =>
      b.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.mobile?.includes(searchTerm) ||
      b.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    const csvHeader = ['ID,Full Name,Mobile,Email,City'];
    const csvRows = filteredBorrowers.map(
      (b) => `${b.borrower_id},"${b.full_name}",${b.mobile},"${b.email || ''}","${b.city || ''}"`
    );
    const csvString = [csvHeader, ...csvRows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `borrowers_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const handleDeleteClick = (borrower) => {
    setConfirmModal({ open: true, data: borrower });
  };

  const handleConfirmDelete = async () => {
    if (confirmModal.data) {
      await deleteBorrower(confirmModal.data.borrower_id);
    }
    setConfirmModal({ open: false, data: null });
  };

  return (
    <div className="borrowers-page">
      <div className="dashboard-header">
        <div className="dashboard-text">
          <h2 className="dashboard-title">👥 Borrowers</h2>
          <p className="dashboard-subtitle">Manage member profiles and contact information</p>
        </div>

        {hasPermission('borrower.create') && (
          <Button
            variant="primary"
            className="add-btn"
            onClick={() => setOpenAddModal(true)}
            text={
              <>
                <UserPlus size={18} /> Add Borrower
              </>
            }
          />
        )}
      </div>

      <div
        style={{
          background: 'var(--bg-surface)',
          padding: '16px',
          borderRadius: '16px',
          border: '1px solid var(--border-main)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          boxShadow: 'var(--shadow-main)',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }}
          />
          <input
            type="text"
            placeholder="Search by name, mobile or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px 12px 42px',
              borderRadius: '12px',
              border: '1px solid var(--border-main)',
              fontSize: '14px',
              backgroundColor: 'var(--input-bg)',
              color: 'var(--text-main)',
              outline: 'none',
              transition: 'all 0.2s',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleExport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-main)',
              background: 'var(--bg-secondary)',
              fontSize: '13px',
              fontWeight: '500',
              color: 'var(--text-main)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <BorrowersTable
        borrowers={filteredBorrowers}
        loading={borrowersLoading}
        onView={(b) => navigate(`/borrowers/view/${b.borrower_id}`)}
        onEdit={
          hasPermission('borrower.edit')
            ? (b) => {
                setSelectedBorrower(b);
                setOpenEditModal(true);
              }
            : undefined
        }
        onDelete={hasPermission('borrower.delete') ? handleDeleteClick : undefined}
      />

      <AddBorrowerModal
        open={openAddModal}
        onClose={() => {
          setOpenAddModal(false);
          if (initialModal === 'add-borrower') navigate('/borrowers');
        }}
        onSave={async (data) => {
          const res = await addBorrower(data);
          if (res.success && initialModal === 'add-borrower') navigate('/borrowers');
        }}
      />

      <ViewBorrowerModal
        open={openViewModal}
        borrower={selectedBorrower}
        onClose={() => navigate('/borrowers')}
      />

      {selectedBorrower && (
        <EditBorrowerModal
          open={openEditModal}
          borrower={selectedBorrower}
          onClose={() => {
            setOpenEditModal(false);
            navigate('/borrowers');
          }}
          onSave={async (data) => {
            const res = await updateBorrower(selectedBorrower.borrower_id, data);
            if (res.success) {
              setOpenEditModal(false);
              navigate('/borrowers');
            }
          }}
        />
      )}

      <ConfirmationModal
        open={confirmModal.open}
        onClose={() => {
          setConfirmModal({ open: false, data: null });
          if (initialModal === 'delete-borrower') navigate('/borrowers'); // specific check
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Borrower"
        message={`Are you sure you want to delete ${confirmModal.data?.full_name}? This will remove all their personal records.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default BorrowersPage;
