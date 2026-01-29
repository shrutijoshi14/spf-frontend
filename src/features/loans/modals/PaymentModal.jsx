import { useState } from 'react';
import Button from '../../../common/Button';
import Modal from '../../../common/Modal';
import Select from '../../../common/Select';

const PaymentModal = ({ open, loan, onClose, onSubmit }) => {
  const [type, setType] = useState('EMI');
  const [amount, setAmount] = useState('');

  if (!open || !loan) return null;

  return (
    <Modal open={open} title="Make Payment" onClose={onClose}>
      <Select
        options={['EMI', 'PRINCIPAL', 'INTEREST', 'PENALTY']}
        value={type}
        onChange={(value) => setType(value)}
      />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <Button
        text="Pay Now"
        onClick={() =>
          onSubmit({
            loanId: loan.loan_id,
            type,
            amount: Number(amount),
          })
        }
      />
    </Modal>
  );
};

export default PaymentModal;
