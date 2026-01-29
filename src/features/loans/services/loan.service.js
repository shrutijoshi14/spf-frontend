import api from '../../../utils/api';

// Get all loans
export const fetchLoans = () => api.get('/loans');

// Get single loan by ID
export const fetchLoanById = (id) => api.get(`/loans/${id}`);

// Update loan
export const updateLoan = (id, data) => api.put(`/loans/${id}`, data);

// Make payment
export const makePayment = (data) => api.post('/payments', data);

// Loan topup
export const addTopup = (data) => api.post('/loan-topup', data);
