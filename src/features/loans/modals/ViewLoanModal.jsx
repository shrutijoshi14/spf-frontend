import { FileX } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Button from '../../../common/Button';
import ConfirmationModal from '../../../common/ConfirmationModal';
import Loader from '../../../common/Loader';
import Modal from '../../../common/Modal';
import { useAuth } from '../../../context/AuthContext';
import { useLoanContext } from '../../../context/LoanContext';
import '../../../styles/modal.css';
import API from '../../../utils/api';
import { formatDate } from '../../../utils/dateUtils';
import EditPaymentModal from '../../payments/modals/EditPaymentModal';
import EditPenaltyModal from './EditPenaltyModal';
import EditTopupModal from './EditTopupModal';
import './view-loan-modal.css';

const ViewLoanModal = ({ open, loanId, onClose, onEdit }) => {
  const {
    deletePayment,
    updatePayment,
    deleteTopup,
    deletePenalty,
    updateTopup,
    updatePenalty,
    loans, // Used to trigger refresh
  } = useLoanContext();
  const { hasPermission } = useAuth(); // Import hasPermission
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('payments');
  const [activePenaltyTab, setActivePenaltyTab] = useState('applied');

  // Payment Edit State
  const [paymentToEdit, setPaymentToEdit] = useState(null);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);

  // Topup Edit State
  const [topupToEdit, setTopupToEdit] = useState(null);
  const [openTopupModal, setOpenTopupModal] = useState(false);

  // Penalty Edit State
  const [penaltyToEdit, setPenaltyToEdit] = useState(null);
  const [openPenaltyModal, setOpenPenaltyModal] = useState(false);

  // Confirmation State
  const [confirmModal, setConfirmModal] = useState({ open: false, payment: null });

  const fetchDetails = useCallback(async () => {
    if (!loanId) return;
    try {
      setLoading(true);
      const res = await API.get(`/loans/${loanId}/details`);
      setData(res.data.data);
    } catch (err) {
      console.error('❌ View Loan Error:', err);
    } finally {
      setLoading(false);
    }
  }, [loanId]);

  useEffect(() => {
    if (open) fetchDetails();
  }, [open, fetchDetails, loans]); // ✅ Auto-refresh when global loans change

  const handleDeleteClick = (type, item) => {
    setConfirmModal({ open: true, type, data: item });
  };

  const handleConfirmDelete = async () => {
    const { type, data } = confirmModal;
    if (!type || !data) return;

    let res = { success: false };

    if (type === 'payment') {
      res = await deletePayment(data.payment_id);
    } else if (type === 'topup') {
      res = await deleteTopup(data.topup_id);
    } else if (type === 'penalty') {
      res = await deletePenalty(data.penalty_id);
    }

    if (res.success) {
      setConfirmModal({ open: false, type: null, data: null });
      fetchDetails();
    }
  };

  const handleEditPayment = (payment) => {
    setPaymentToEdit(payment);
    setOpenPaymentModal(true);
  };

  const handlePaymentUpdate = async (updatedData) => {
    const res = await updatePayment(updatedData.payment_id, updatedData);
    if (res.success) {
      setOpenPaymentModal(false);
      setPaymentToEdit(null);
      fetchDetails();
    }
  };

  const handleEditTopup = (topup) => {
    setTopupToEdit(topup);
    setOpenTopupModal(true);
  };

  const handleTopupUpdate = async (updatedData) => {
    const res = await updateTopup(updatedData.topup_id, updatedData);
    if (res.success) {
      setOpenTopupModal(false);
      setTopupToEdit(null);
      fetchDetails();
    }
  };

  const handleEditPenalty = (penalty) => {
    setPenaltyToEdit(penalty);
    setOpenPenaltyModal(true);
  };

  const handlePenaltyUpdate = async (updatedData) => {
    const res = await updatePenalty(updatedData.penalty_id, updatedData);
    if (res.success) {
      setOpenPenaltyModal(false);
      setPenaltyToEdit(null);
      fetchDetails();
    }
  };

  // Helper for Indian Currency Formatting
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (!open) return null;

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <div className="modal-header sticky-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3>💰 Loan Details</h3>
            <span
              style={{
                background: 'var(--nav-active)',
                color: 'var(--accent)',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '14px',
                fontWeight: '600',
                border: '1px solid var(--border-main)',
              }}
            >
              #{loanId}
            </span>
          </div>
          <button className="modal-close" onClick={onClose}>
            <span>×</span>
          </button>
        </div>

        <div className="modal-body-scroll" style={{ padding: '0', flex: '1' }}>
          {loading && (
            <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
              <Loader />
            </div>
          )}

          {!loading && data && (
            <div className="vl-container">
              {/* LEFT SIDEBAR - STATIC INFO */}
              <div className="vl-sidebar">
                <div className="info-card">
                  <h4>👤 Borrower</h4>
                  <p>
                    <strong>Name:</strong> <span>{data.loan.full_name}</span>
                  </p>
                  <p>
                    <strong>Mobile:</strong> <span>{data.loan.mobile}</span>
                  </p>
                  <p>
                    <strong>Email:</strong> <span>{data.loan.email || 'N/A'}</span>
                  </p>
                </div>

                <div className="info-card">
                  <h4>💰 Loan Info</h4>
                  <p>
                    <strong>Principal:</strong>{' '}
                    <span>₹{formatCurrency(data.loan.principal_amount)}</span>
                  </p>
                  <p>
                    <strong>Disbursed:</strong>{' '}
                    <span>{formatDate(data.loan.disbursement_date)}</span>
                  </p>
                  <p>
                    <strong>Due Date:</strong>{' '}
                    <span>{data.loan.due_date ? formatDate(data.loan.due_date) : 'N/A'}</span>
                  </p>
                  <p>
                    <strong>Rate:</strong>{' '}
                    <span>
                      {data.loan.interest_rate}% ({data.loan.interest_type})
                    </span>
                  </p>
                  <p>
                    <strong>Tenure:</strong>{' '}
                    <span>
                      {data.loan.tenure_value} {data.loan.tenure_unit}(s)
                    </span>
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span className={`loan-status ${data.loan.status.toLowerCase()}`}>
                      {data.loan.status}
                    </span>
                  </p>
                  <p>
                    <strong>Purpose:</strong> <span>{data.loan.purpose || 'N/A'}</span>
                  </p>

                  {/* INTEREST & PENALTY BREAKDOWN */}
                  <hr style={{ borderColor: 'var(--border-main)', margin: '12px 0' }} />

                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1.5px solid #ef4444',
                    }}
                  >
                    <h5 style={{ margin: '0 0 6px 0', color: '#ef4444', fontSize: '0.9rem' }}>
                      ⚠️ Liability Check
                    </h5>
                    <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>
                      <strong>Monthly Interest:</strong> ₹
                      {formatCurrency(
                        Math.round(
                          data.loan.interest_type === 'REDUCING'
                            ? (Number(data.loan.outstanding_amount) *
                                Number(data.loan.interest_rate)) /
                                100
                            : (Number(data.loan.principal_amount) *
                                Number(data.loan.interest_rate)) /
                                100
                        )
                      )}
                    </p>

                    <hr style={{ margin: '8px 0', borderColor: 'var(--border-main)' }} />

                    {/* Penalty Calculations */}
                    {(() => {
                      const totalApplied = data.penalties.reduce(
                        (sum, p) => sum + Number(p.penalty_amount),
                        0
                      );
                      const totalPaid = data.payments
                        .filter((p) => p.payment_for === 'PENALTY' || p.payment_type === 'PENALTY')
                        .reduce((sum, p) => sum + (Number(p.payment_amount) || 0), 0);
                      const pending = totalApplied - totalPaid;

                      return (
                        <>
                          <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>
                            <strong>Penalty Applied:</strong> ₹{formatCurrency(totalApplied)}
                          </p>
                          <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#10b981' }}>
                            <strong>Penalty Paid:</strong> ₹{formatCurrency(totalPaid)}
                          </p>
                          <p
                            style={{
                              margin: '4px 0',
                              fontSize: '0.85rem',
                              color: pending > 0 ? '#ef4444' : '#10b981',
                            }}
                          >
                            <strong>Penalty Pending:</strong> ₹{formatCurrency(pending)}
                          </p>
                        </>
                      );
                    })()}

                    <p
                      style={{
                        margin: '8px 0 0',
                        fontSize: '0.8rem',
                        color: '#ef4444',
                        fontStyle: 'italic',
                        display: 'block', // Override any flex/justify behavior from parent
                        textAlign: 'left',
                      }}
                    >
                      * Daily Penalty: ₹{data.settings?.penalty_amount || 50}/day if unpaid after{' '}
                      <span style={{ whiteSpace: 'nowrap' }}>
                        📅 {data.settings?.penalty_days || 5}
                        <span
                          style={{
                            fontSize: '0.75em',
                            verticalAlign: 'text-top',
                            lineHeight: '1',
                            marginLeft: '1px',
                          }}
                        >
                          {['st', 'nd', 'rd'][
                            (((((data.settings?.penalty_days || 5) + 90) % 100) - 10) % 10) - 1
                          ] || 'th'}
                        </span>
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT MAIN - HISTORY TABLES */}
              <div className="vl-main">
                <div className="vl-tabs">
                  <button
                    className={activeTab === 'payments' ? 'active' : ''}
                    onClick={() => setActiveTab('payments')}
                  >
                    Payments
                  </button>
                  <button
                    className={activeTab === 'topups' ? 'active' : ''}
                    onClick={() => setActiveTab('topups')}
                  >
                    Top-ups
                  </button>
                  <button
                    className={activeTab === 'penalties' ? 'active' : ''}
                    onClick={() => setActiveTab('penalties')}
                  >
                    Penalties
                  </button>
                </div>

                <div className="vl-content">
                  {activeTab === 'payments' && (
                    <HistoryTable
                      variant="green"
                      headers={['Date', 'Amount', 'For', 'Mode', 'Remarks', 'Actions']}
                      rows={data.payments}
                      mapRow={(p) => (
                        <tr key={p.payment_id}>
                          <td>{formatDate(p.payment_date)}</td>
                          <td>₹{formatCurrency(p.payment_amount)}</td>
                          <td>
                            {/* Fallback to payment_type for old records if payment_for is missing */}
                            <span className="badge-blue">
                              {p.payment_for || p.payment_type || 'EMI'}
                            </span>
                          </td>
                          <td>{p.payment_mode || 'N/A'}</td>
                          <td
                            title={p.remarks}
                            style={{
                              maxWidth: '150px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {p.remarks || '-'}
                          </td>
                          <td className="actions-cell">
                            <button
                              className="icon-btn edit-btn"
                              onClick={() => {
                                setPaymentToEdit(p);
                                setOpenPaymentModal(true);
                              }}
                              title="Edit Payment"
                            >
                              <FaEdit />
                            </button>
                            {hasPermission('payment.delete') && (
                              <button
                                className="icon-btn delete-btn"
                                onClick={() => handleDeleteClick('payment', p)}
                                title="Delete Payment"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </td>
                        </tr>
                      )}
                      emptyMsg="No payments recorded"
                    />
                  )}

                  {activeTab === 'topups' && (
                    <HistoryTable
                      variant="orange"
                      headers={['Date', 'Amount', 'Actions']}
                      rows={data.topups}
                      mapRow={(t) => (
                        <tr key={t.topup_id}>
                          <td>{formatDate(t.topup_date)}</td>
                          <td>₹{formatCurrency(t.topup_amount)}</td>
                          <td className="actions-cell">
                            <button
                              className="icon-btn edit-btn"
                              onClick={() => handleEditTopup(t)}
                              title="Edit Topup"
                            >
                              <FaEdit />
                            </button>
                            {hasPermission('loan.delete') && ( // Recycled or specific? Using loan.delete for now or topup.delete if exists
                              <button
                                className="icon-btn delete-btn"
                                onClick={() => handleDeleteClick('topup', t)}
                                title="Delete Topup"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </td>
                        </tr>
                      )}
                      emptyMsg="No top-ups recorded"
                    />
                  )}

                  {activeTab === 'penalties' && (
                    <>
                      <div
                        style={{
                          display: 'flex',
                          gap: '10px',
                          marginBottom: '16px',
                          borderBottom: '1px solid var(--border-main)',
                          paddingBottom: '8px',
                        }}
                      >
                        <button
                          style={{
                            background: 'none',
                            border: 'none',
                            color:
                              activePenaltyTab === 'paid' ? 'var(--accent)' : 'var(--text-muted)',
                            fontWeight: activePenaltyTab === 'paid' ? '600' : '400',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                          }}
                          onClick={() => setActivePenaltyTab('paid')}
                        >
                          Penalty Paid
                        </button>
                        <button
                          style={{
                            background: 'none',
                            border: 'none',
                            color:
                              activePenaltyTab === 'applied'
                                ? 'var(--accent)'
                                : 'var(--text-muted)',
                            fontWeight: activePenaltyTab === 'applied' ? '600' : '400',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                          }}
                          onClick={() => setActivePenaltyTab('applied')}
                        >
                          Penalty Applied
                        </button>
                      </div>

                      {activePenaltyTab === 'applied' && (
                        <>
                          <h5 style={{ margin: '0 0 8px', color: 'var(--text-muted)' }}>
                            Applied Penalties
                          </h5>
                          {/* Grouping Logic for Automatic Penalties */}
                          {(() => {
                            // 1. Separate Manual vs Automatic (simplified check: reason='Daily Penalty')
                            const groupedPenalties = [];
                            console.log('🔍 Raw Penalties:', data.penalties);
                            const sortedPenalties = [...data.penalties].sort(
                              (a, b) => new Date(a.penalty_date) - new Date(b.penalty_date)
                            );

                            let currentGroup = null;

                            sortedPenalties.forEach((p) => {
                              // User requested NO GROUPING. Show every single day entry.
                              const isAutomatic = false;

                              if (isAutomatic) {
                                if (
                                  currentGroup &&
                                  new Date(p.penalty_date).getTime() -
                                    new Date(currentGroup.endDate).getTime() <=
                                    86400000 + 1000 // approx 1 day diff
                                ) {
                                  // Continue group
                                  currentGroup.endDate = p.penalty_date;
                                  currentGroup.amount += Number(p.penalty_amount);
                                  currentGroup.count += 1;
                                  currentGroup.ids.push(p.penalty_id);
                                } else {
                                  // Start new group
                                  if (currentGroup) groupedPenalties.push(currentGroup);
                                  currentGroup = {
                                    type: 'automatic',
                                    startDate: p.penalty_date,
                                    endDate: p.penalty_date,
                                    amount: Number(p.penalty_amount),
                                    reason: 'Daily Penalty',
                                    count: 1,
                                    ids: [p.penalty_id],
                                  };
                                }
                              } else {
                                // Push previous group if exists
                                if (currentGroup) {
                                  groupedPenalties.push(currentGroup);
                                  currentGroup = null;
                                }
                                // Push manual penalty as single item
                                groupedPenalties.push({
                                  type: 'manual',
                                  ...p,
                                });
                              }
                            });
                            if (currentGroup) groupedPenalties.push(currentGroup);

                            // Sort descending for display
                            groupedPenalties.sort((a, b) => {
                              const dateA = a.type === 'automatic' ? a.startDate : a.penalty_date;
                              const dateB = b.type === 'automatic' ? b.startDate : b.penalty_date;
                              return new Date(dateB) - new Date(dateA);
                            });

                            return (
                              <HistoryTable
                                variant="red"
                                headers={[
                                  'Date Range / Date',
                                  'Total / Amount',
                                  'Reason',
                                  'Actions',
                                ]}
                                rows={groupedPenalties}
                                mapRow={(item) => (
                                  <tr
                                    key={
                                      item.type === 'automatic'
                                        ? `group-${item.startDate}`
                                        : item.penalty_id
                                    }
                                  >
                                    <td>
                                      {item.type === 'automatic' ? (
                                        <span title={`${item.count} days`}>
                                          {formatDate(item.startDate)} - {formatDate(item.endDate)}
                                        </span>
                                      ) : (
                                        formatDate(item.penalty_date)
                                      )}
                                    </td>
                                    <td>
                                      ₹
                                      {formatCurrency(
                                        item.type === 'automatic'
                                          ? item.amount
                                          : item.penalty_amount
                                      )}
                                    </td>
                                    <td>
                                      {item.reason}{' '}
                                      {item.type === 'automatic' ? `(${item.count} days)` : ''}
                                    </td>
                                    <td className="actions-cell">
                                      {item.type === 'manual' ? (
                                        <>
                                          <button
                                            className="icon-btn edit-btn"
                                            onClick={() => handleEditPenalty(item)}
                                            title="Edit Penalty"
                                          >
                                            <FaEdit />
                                          </button>
                                          {hasPermission('payment.delete') && ( // Assuming penalty delete same as payment for now or add specific
                                            <button
                                              className="icon-btn delete-btn"
                                              onClick={() => handleDeleteClick('penalty', item)}
                                              title="Delete Penalty"
                                            >
                                              <FaTrash />
                                            </button>
                                          )}
                                        </>
                                      ) : (
                                        // For groups, maybe allow deleting the whole range? Or just info?
                                        // User said "icant delete penalties of autmatically penalty added".
                                        // Maybe allow deleting the GROUP?
                                        <button
                                          className="icon-btn delete-btn"
                                          onClick={async () => {
                                            if (
                                              window.confirm(
                                                `Delete all ${item.count} penalties in this range?`
                                              )
                                            ) {
                                              try {
                                                await Promise.all(
                                                  item.ids.map((id) => deletePenalty(id))
                                                );
                                                fetchDetails();
                                              } catch (err) {
                                                console.error(err);
                                              }
                                            }
                                          }}
                                          title="Delete All in Range"
                                        >
                                          <FaTrash />
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                )}
                                emptyMsg="No penalties recorded"
                              />
                            );
                          })()}
                        </>
                      )}

                      {activePenaltyTab === 'paid' && (
                        <>
                          <h5 style={{ margin: '0 0 8px', color: 'var(--text-muted)' }}>
                            Penalty Payments
                          </h5>
                          <HistoryTable
                            variant="red"
                            headers={['Date', 'Amount', 'Mode', 'Remarks', 'Actions']}
                            rows={data.payments.filter(
                              (p) => p.payment_for === 'PENALTY' || p.payment_type === 'PENALTY'
                            )}
                            mapRow={(p) => (
                              <tr key={p.payment_id}>
                                <td>{formatDate(p.payment_date)}</td>
                                <td>₹{formatCurrency(p.payment_amount)}</td>
                                <td>{p.payment_mode || 'N/A'}</td>
                                <td
                                  title={p.remarks}
                                  style={{
                                    maxWidth: '150px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {p.remarks || '-'}
                                </td>
                                <td className="actions-cell">
                                  <button
                                    className="icon-btn edit-btn"
                                    onClick={() => {
                                      setPaymentToEdit(p);
                                      setOpenPaymentModal(true);
                                    }}
                                    title="Edit Payment"
                                  >
                                    <FaEdit />
                                  </button>
                                  {hasPermission('payment.delete') && (
                                    <button
                                      className="icon-btn delete-btn"
                                      onClick={() => handleDeleteClick('payment', p)}
                                      title="Delete Payment"
                                    >
                                      <FaTrash />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            )}
                            emptyMsg="No penalty payments recorded"
                          />
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sticky-footer">
          <Button text="Edit" variant="outline" onClick={() => onEdit(data.loan)} />
          <Button text="Close" onClick={onClose} />
        </div>
      </Modal>

      <EditPaymentModal
        open={openPaymentModal}
        loan={data?.loan}
        paymentToEdit={paymentToEdit}
        onClose={() => {
          setOpenPaymentModal(false);
          setPaymentToEdit(null);
        }}
        onSubmit={handlePaymentUpdate}
      />
      <EditTopupModal
        open={openTopupModal}
        loan={data?.loan}
        topupToEdit={topupToEdit}
        onClose={() => {
          setOpenTopupModal(false);
          setTopupToEdit(null);
        }}
        onSubmit={handleTopupUpdate}
      />
      <EditPenaltyModal
        open={openPenaltyModal}
        loan={data?.loan}
        penaltyToEdit={penaltyToEdit}
        onClose={() => {
          setOpenPenaltyModal(false);
          setPenaltyToEdit(null);
        }}
        onSubmit={handlePenaltyUpdate}
      />
      <ConfirmationModal
        open={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, payment: null })}
        onConfirm={handleConfirmDelete}
        title={`Delete ${confirmModal.type ? confirmModal.type.charAt(0).toUpperCase() + confirmModal.type.slice(1) : 'Item'}`}
        message={`Are you sure you want to delete this ${confirmModal.type}? Loan balance will be adjusted.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
};

const HistoryTable = ({ headers, rows, mapRow, emptyMsg, variant = 'blue' }) => {
  if (!rows || rows.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          color: 'var(--text-muted)',
          border: '1px solid var(--border-main)',
          borderRadius: '12px',
          background: 'var(--bg-secondary)',
        }}
      >
        <FileX size={48} strokeWidth={1.5} style={{ marginBottom: '12px', opacity: 0.8 }} />
        <span style={{ fontSize: '15px', fontWeight: '500' }}>{emptyMsg}</span>
      </div>
    );
  }
  return (
    <div className={`table-wrapper border-${variant}`}>
      <div className="table-scroll-container">
        <table className="history-table">
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>{rows.map(mapRow)}</tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewLoanModal;
