import { ArrowRight, FileText, Upload } from 'lucide-react';
import { useState } from 'react';
import Button from '../../../common/Button';
import Modal from '../../../common/Modal';
import API from '../../../utils/api';

const ImportLoansModal = ({ open, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  if (!open) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setErrors(['Please upload a valid CSV file.']);
        return;
      }
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const selectedFile = e.dataTransfer.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setErrors(['Please upload a valid CSV file.']);
        return;
      }
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

      const required = ['name', 'principal', 'rate', 'tenure', 'type', 'date'];
      const missing = required.filter((r) => !headers.some((h) => h.includes(r)));

      if (missing.length > 0) {
        setErrors([`Missing columns: ${missing.join(', ')}`]);
        setPreviewData([]);
        return;
      }

      const rows = [];
      const errs = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = line.split(',');
        if (cols.length < required.length) {
          errs.push(`Row ${i + 1}: Incomplete data`);
          continue;
        }

        const rowData = {
          borrower_name: cols[0]?.trim(),
          principal_amount: parseFloat(cols[1]?.trim()),
          interest_rate: parseFloat(cols[2]?.trim()),
          tenure_months: parseInt(cols[3]?.trim()),
          payment_frequency: cols[4]?.trim().toUpperCase(),
          disbursement_date: cols[5]?.trim(),
        };

        if (!rowData.borrower_name || isNaN(rowData.principal_amount)) {
          errs.push(`Row ${i + 1}: Invalid data`);
        } else {
          rows.push(rowData);
        }
      }

      setPreviewData(rows);
      setErrors(errs);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (previewData.length === 0) return;
    setIsUploading(true);
    try {
      const res = await API.post('/loans/import', { loans: previewData });

      if (res.data.success) {
        if (onSuccess) onSuccess(res.data);
        onClose();
        setFile(null);
        setPreviewData([]);
      }
    } catch (err) {
      console.error(err);
      setErrors([err.response?.data?.message || 'Import failed.']);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-header sticky-header">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Upload size={20} style={{ color: 'var(--accent)' }} /> Import Loans
        </h3>
        <button className="modal-close" onClick={onClose}>
          <span>×</span>
        </button>
      </div>

      <div className="modal-body-scroll">
        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${isDragOver ? 'var(--accent)' : 'var(--border-main)'}`,
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              backgroundColor: isDragOver ? 'var(--nav-active)' : 'var(--bg-secondary)',
              transition: 'all 0.2s',
              cursor: 'pointer',
            }}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'var(--nav-active)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent)',
                  border: '1px solid var(--border-main)',
                }}
              >
                <FileText size={24} />
              </div>
              <div>
                <p style={{ fontWeight: '500', color: 'var(--text-main)', marginBottom: '4px' }}>
                  Click to upload or drag and drop
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  CSV files only (Max 5MB)
                </p>
              </div>
            </label>
            <div
              style={{
                marginTop: '20px',
                fontSize: '12px',
                color: 'var(--text-muted)',
                textAlign: 'left',
                background: 'var(--bg-surface)',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border-main)',
              }}
            >
              <strong>Expected CSV Format:</strong>
              <br />
              Name, Principal, Rate (%), Tenure (Months), Type (Weekly/Monthly/Daily), Date
              (YYYY-MM-DD)
            </div>
          </div>
        ) : (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                background: 'var(--bg-secondary)',
                borderRadius: '8px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-main)' }}>
                  {file.name}
                </span>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setPreviewData([]);
                  setErrors([]);
                }}
                style={{
                  color: '#ef4444',
                  fontSize: '13px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Remove
              </button>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '12px',
                  color: '#10b981',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>
                  Valid Rows
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700' }}>{previewData.length}</div>
              </div>
              {errors.length > 0 && (
                <div
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '12px',
                    color: 'var(--danger)',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>
                    Errors/Warnings
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>{errors.length}</div>
                </div>
              )}
            </div>

            {previewData.length > 0 && (
              <div className="table-wrapper border-blue">
                <div className="table-scroll-container">
                  <table style={{ width: '100%', fontSize: '13px' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '10px 12px', textAlign: 'left' }}>Name</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left' }}>Amount</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 5).map((row, i) => (
                        <tr key={i}>
                          <td style={{ padding: '10px 12px' }}>{row.borrower_name}</td>
                          <td style={{ padding: '10px 12px' }}>{row.principal_amount}</td>
                          <td style={{ padding: '10px 12px' }}>{row.disbursement_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {previewData.length > 5 && (
                  <div
                    style={{
                      padding: '8px',
                      textAlign: 'center',
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      background: 'var(--bg-secondary)',
                    }}
                  >
                    + {previewData.length - 5} more rows...
                  </div>
                )}
              </div>
            )}

            {errors.length > 0 && (
              <div
                style={{
                  marginTop: '16px',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-main)',
                  fontSize: '13px',
                }}
              >
                {errors.map((e, i) => (
                  <div key={i} style={{ color: 'var(--danger)', marginBottom: '4px' }}>
                    • {e}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="sticky-footer">
        <Button text="Cancel" variant="outline" onClick={onClose} />
        <Button
          text={isUploading ? 'Importing...' : 'Import Loans'}
          onClick={handleImport}
          disabled={!file || previewData.length === 0 || isUploading}
          icon={<ArrowRight size={16} />}
        />
      </div>
    </Modal>
  );
};

export default ImportLoansModal;
