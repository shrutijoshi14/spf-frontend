import { Plus, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../../../common/Button';
import { useLoanContext } from '../../../context/LoanContext';
import '../buttons.css';

const Buttons = ({ onAddBorrower, onAddLoan }) => {
  const { borrowers, borrowersLoading } = useLoanContext();
  const hasBorrowers = borrowers.length > 0;

  return (
    <div className="buttons-container">
      <div className="action-buttons-row">
        {/* ADD BORROWER */}
        {onAddBorrower && (
          <Button
            onClick={onAddBorrower}
            variant="primary"
            className="add-btn"
            text={
              <>
                <UserPlus size={18} />
                <span>Add Borrower</span>
              </>
            }
          />
        )}

        {/* ADD LOAN */}
        {onAddLoan && (
          <Button
            onClick={() => {
              if (!hasBorrowers) {
                toast.info('Please add a borrower first');
                return;
              }
              onAddLoan();
            }}
            variant="outline"
            className="add-btn"
            text={
              <>
                <Plus size={20} />
                <span>Add Loan</span>
              </>
            }
          />
        )}
      </div>

      {/* WARNING / NOTICE */}
      {!hasBorrowers && !borrowersLoading && (
        <div className="notice-row">
          <div className="borrower-notice">
            <div className="notice-icon">⚠️</div>
            <p>
              Please <strong>Add Borrower</strong> before creating a loan.
            </p>
          </div>
        </div>
      )}

      {borrowersLoading && <p className="loading-text">Checking for borrowers...</p>}
    </div>
  );
};

export default Buttons;
