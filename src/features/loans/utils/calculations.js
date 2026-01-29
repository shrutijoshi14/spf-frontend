// export const calculateMonthlyInterest = (outstanding, rate) => {
//   return (outstanding * rate) / 100;
// };

export const calculateMonthlyInterest = (principal, rate) => {
  return (principal * rate) / 100 / 12;
};

export const calculatePenalty = (lateDays) => {
  return lateDays * 15;
};

export const calculateOutstanding = ({ principal, interest = 0, penalty = 0, payments = 0 }) => {
  return principal + interest + penalty - payments;
};

export const calculateEMI = (principal, rate, months) => {
  const r = rate / 12 / 100;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
};

export const applyPayment = (loan, payment) => {
  let updatedLoan = { ...loan };

  switch (payment.type) {
    case 'EMI':
      updatedLoan.outstanding -= payment.amount;
      break;

    case 'PRINCIPAL':
      updatedLoan.principal -= payment.amount;
      updatedLoan.outstanding -= payment.amount;
      break;

    case 'INTEREST':
      updatedLoan.interestPaid += payment.amount;
      break;

    case 'PENALTY':
      updatedLoan.penalty -= payment.amount;
      break;

    case 'TOPUP':
      updatedLoan.principal += payment.amount;
      updatedLoan.outstanding += payment.amount;
      break;

    default:
      return loan;
  }

  updatedLoan.monthlyInterest = calculateMonthlyInterest(
    updatedLoan.outstanding,
    updatedLoan.interestRate
  );

  return updatedLoan;
};
