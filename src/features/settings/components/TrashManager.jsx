import { RefreshCw, RotateCcw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import API from '../../../utils/api';
import { formatDateTime } from '../../../utils/dateUtils';
import './TrashManager.css';

const TrashManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(null);

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const res = await API.get('/trash');
      if (res.data.success) {
        setItems(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load trash items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (item) => {
    setRestoring(item.id);
    try {
      await API.post('/trash/restore', { type: item.type, id: item.id });
      toast.success(`${item.type} restored successfully`);
      setItems((prev) => prev.filter((i) => i.id !== item.id || i.type !== item.type));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Restore failed');
    } finally {
      setRestoring(null);
    }
  };

  if (loading && items.length === 0) {
    return <div className="trash-loading">Loading trash...</div>;
  }

  return (
    <div className="trash-manager">
      <div className="trash-header">
        <h3>Deleted Items</h3>
        <button className="refresh-btn" onClick={fetchTrash} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="trash-empty">
          <Trash2 size={48} />
          <p>Trash is empty. No deleted items found.</p>
        </div>
      ) : (
        <div className="trash-list">
          {items.map((item) => (
            <div key={`${item.type}-${item.id}`} className="trash-item">
              <div className="trash-item-info">
                <span className={`badge ${item.type.toLowerCase()}`}>{item.type}</span>
                <div className="item-details">
                  <strong>{item.full_name || item.id}</strong>
                  {item.type === 'LOAN' && <span>₹{item.principal_amount}</span>}
                  <span className="deleted-at">Deleted: {formatDateTime(item.deleted_at)}</span>
                </div>
              </div>
              <button
                className="restore-btn"
                onClick={() => handleRestore(item)}
                disabled={restoring === item.id}
              >
                <RotateCcw size={16} />
                {restoring === item.id ? '...' : 'Restore'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrashManager;
