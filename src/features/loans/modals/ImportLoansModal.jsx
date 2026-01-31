import { ArrowRight, FileText, Upload } from 'lucide-react';
import { useState } from 'react';
import Button from '../../../common/Button';
import Modal from '../../../common/Modal';
import API from '../../../utils/api';

const ImportLoansModal = ({ open, onClose, onSuccess, type = 'loans', loanId }) => {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  if (!open) return null;

  // Configuration based on Type
  const getConfig = () => {
    switch (type) {
      case 'payments':
        return {
          title: 'Import Payments',
          required: ['date', 'amount', 'mode'],
          expected: 'Date (YYYY-MM-DD), Amount, Mode, Remarks',
          api: `/payments/import`, // Placeholder
          mapRow: (cols) => ({
            loan_id: loanId,
            payment_date: cols[0]?.trim(),
            payment_amount: parseFloat(cols[1]?.trim()),
            payment_mode: cols[2]?.trim(),
            remarks: cols[3]?.trim(),
            payment_for: 'EMI',
          }),
        };
      case 'topups':
        return {
          title: 'Import Top-ups',
          required: ['date', 'amount'],
          expected: 'Date (YYYY-MM-DD), Amount',
          api: `/topups/import`, // Placeholder
          mapRow: (cols) => ({
            loan_id: loanId,
            topup_date: cols[0]?.trim(),
            topup_amount: parseFloat(cols[1]?.trim()),
          }),
        };
      case 'penalties':
        return {
          title: 'Import Penalties',
          required: ['date', 'amount', 'reason'],
          expected: 'Date (YYYY-MM-DD), Amount, Reason',
          api: `/penalties/import`, // Placeholder
          mapRow: (cols) => ({
            loan_id: loanId,
            penalty_date: cols[0]?.trim(),
            penalty_amount: parseFloat(cols[1]?.trim()),
            reason: cols[2]?.trim(),
          }),
        };
      case 'loans':
      default:
        return {
          title: 'Import Loans',
          required: ['name', 'principal', 'rate', 'tenure', 'type', 'date'],
          expected: 'Name, Principal, Rate (%), Tenure (Months), Type (Weekly/Monthly/Daily), Date',
          api: '/loans/import',
          mapRow: (cols) => ({
            borrower_name: cols[0]?.trim(),
            principal_amount: parseFloat(cols[1]?.trim()),
            interest_rate: parseFloat(cols[2]?.trim()),
            tenure_months: parseInt(cols[3]?.trim()),
            payment_frequency: cols[4]?.trim().toUpperCase(),
            disbursement_date: cols[5]?.trim(),
          }),
        };
    }
  };

  const config = getConfig();

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

      const missing = config.required.filter((r) => !headers.some((h) => h.includes(r)));

      // Allow fuzzy matching or skip header check if strict check fails but data looks okay?
      // For now, strict header check as per original code, but adapted for type.
      // Actually, standard CSV imports often skip header check if user knows format.
      // But let's keep it to ensure data quality.

      // FIX: If header check fails, check if user provided NO headers (data in first row)?
      // For safety, assume headers required.

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
        if (cols.length < config.required.length) {
          errs.push(`Row ${i + 1}: Incomplete data`);
          continue;
        }

        const rowData = config.mapRow(cols);

        // Basic Validation
        let isValid = true;
        if (type === 'loans') {
          if (!rowData.borrower_name || isNaN(rowData.principal_amount)) isValid = false;
        } else if (type === 'payments' || type === 'topups' || type === 'penalties') {
          // For sub-items, we need loanId (which comes from props, not CSV usually)
          // But valid amount/date is key.
          if (
            isNaN(rowData.payment_amount) &&
            isNaN(rowData.topup_amount) &&
            isNaN(rowData.penalty_amount)
          )
            isValid = false;
        }

        if (!isValid) {
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

    // Safety check for non-loan imports without backend
    if (type !== 'loans') {
      alert(
        `Backend support for importing ${type} is coming soon! Validated ${previewData.length} rows.`
      );
      onClose();
      return;
    }

    setIsUploading(true);
    try {
      const res = await API.post(config.api, { [type]: previewData }); // Dynamic key: loans, payments...

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
          <Upload size={20} style={{ color: 'var(--accent)' }} /> {config.title}
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
              {config.expected}
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
                        {config.required.map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: '10px 12px',
                              textAlign: 'left',
                              textTransform: 'capitalize',
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 5).map((row, i) => (
                        <tr key={i}>
                          {config.required.map((col, idx) => {
                            // Dynamic mapping back to view isn't trivial without keeping original cols order or reverse key map.
                            // Simplification: Just show values in order 0, 1, 2...
                            // Wait, previewData has keys like 'borrower_name', 'payment_date'.
                            // I need to know which key maps to which header column for display.
                            // For simplicity/robustness, I will trust the mapRow output keys usually match order? No.
                            // Let's just try to display meaningful values based on type.
                            let val = '-';
                            if (type === 'loans') {
                              if (idx === 0) val = row.borrower_name;
                              if (idx === 1) val = row.principal_amount;
                              if (idx === 2) val = row.interest_rate;
                              if (idx === 3) val = row.tenure_months;
                              if (idx === 4) val = row.payment_frequency;
                              if (idx === 5) val = row.disbursement_date;
                            } else if (type === 'payments') {
                              if (idx === 0) val = row.payment_date;
                              if (idx === 1) val = row.payment_amount;
                              if (idx === 2) val = row.payment_mode;
                            } else if (type === 'topups') {
                              if (idx === 0) val = row.topup_date;
                              if (idx === 1) val = row.topup_amount;
                            } else if (type === 'penalties') {
                              if (idx === 0) val = row.penalty_date;
                              if (idx === 1) val = row.penalty_amount;
                              if (idx === 2) val = row.reason;
                            }
                            return (
                              <td key={idx} style={{ padding: '10px 12px' }}>
                                {val}
                              </td>
                            );
                          })}
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
          text={isUploading ? 'Importing...' : `Import ${config.title.replace('Import ', '')}`}
          onClick={handleImport}
          disabled={!file || previewData.length === 0 || isUploading}
          icon={<ArrowRight size={16} />}
        />
      </div>
    </Modal>
  );
};

export default ImportLoansModal;
