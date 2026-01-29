import { Edit, Eye, IndianRupee, MessageCircle, Plus, Trash2, TriangleAlert } from 'lucide-react';

const TableActions = ({ row, onView, onEdit, onPay, onTopup, onPenalty, onWhatsApp, onDelete }) => {
  return (
    <div className="table-actions">
      <button className="icon view" title="View" onClick={() => onView(row)}>
        <Eye size={18} />
      </button>

      {onWhatsApp && (
        <button className="icon whatsapp" title="WhatsApp Reminder" onClick={() => onWhatsApp(row)}>
          <MessageCircle size={18} style={{ color: '#25D366' }} />
        </button>
      )}

      {!onEdit ? null : (
        <button className="icon edit" title="Edit" onClick={() => onEdit(row)}>
          <Edit size={18} />
        </button>
      )}

      {!onPay ? null : (
        <button className="icon pay" title="Pay Now" onClick={() => onPay(row)}>
          <IndianRupee size={18} />
        </button>
      )}

      {onTopup && row.status === 'ACTIVE' && (
        <button className="icon topup" title="Top Up" onClick={() => onTopup(row)}>
          <Plus size={18} />
        </button>
      )}

      {onPenalty && (row.status === 'ACTIVE' || row.status === 'OVERDUE') && (
        <button className="icon penalty" title="Add Penalty" onClick={() => onPenalty(row)}>
          <TriangleAlert size={18} />
        </button>
      )}

      {!onDelete ? null : (
        <button className="icon delete" title="Delete" onClick={() => onDelete(row)}>
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
};

export default TableActions;
