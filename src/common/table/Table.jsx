import { FileX } from 'lucide-react';
import Loader from '../Loader';
import '../table.css';

const Table = ({ columns = [], data = [], loading = false, variant = 'blue', keyField = 'id' }) => {
  return (
    <div className={`table-wrapper border-${variant}`}>
      <div className="table-scroll-container">
        <table className="app-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '0', height: '300px' }}>
                  <Loader />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '40px',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <FileX
                      size={48}
                      strokeWidth={1.5}
                      style={{ marginBottom: '12px', opacity: 0.8 }}
                    />
                    <span style={{ fontSize: '15px', fontWeight: '500' }}>No records found</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={row[keyField] || row.id || row._id || i}>
                  {columns.map((col) => (
                    <td key={col.key}>{col.render ? col.render(row, i) : row[col.key]}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
