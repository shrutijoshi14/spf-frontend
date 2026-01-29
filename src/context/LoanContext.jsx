import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import API from '../utils/api';
import { useBorrowerContext } from './BorrowerContext';

const LoanContext = createContext();

export const LoanProvider = ({ children }) => {
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [error, setError] = useState(null);
  const {
    borrowers,
    loading: borrowersLoading,
    fetchBorrowers,
    addBorrower,
    updateBorrower,
    deleteBorrower,
  } = useBorrowerContext();

  // ✅ Dashboard Data State
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    charts: {
      bar: { labels: [], data: [] },
      pie: { labels: [], data: [] },
      interest: { labels: [], data: [], details: [] }, // Initial state for new chart
    },
    activities: [],
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await API.get('/dashboard');

      if (response.data.success) {
        setDashboardData(response.data.data);
        // toast.success('Dashboard updated!'); // Optional: feedback
      }
    } catch (err) {
      toast.error('Failed to load dashboard data');
    }
  }, []);

  // ✅ Fetch all loans
  const fetchLoans = useCallback(async (search = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get('/loans', {
        params: { search: search || '' },
      });

      if (response.data.success) {
        setLoans(response.data.data || []);
        setError(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch loans');
      setLoans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Fetch all payments
  const fetchPayments = useCallback(async (options = { showLoading: true }) => {
    if (options.showLoading) {
      setPaymentsLoading(true);
    }
    try {
      const response = await API.get('/payments');

      if (response.data.success) {
        setPayments(response.data.data || []);
      }
    } catch (err) {
      console.error('❌ Fetch Payments Error:', err);
    } finally {
      if (options.showLoading) {
        setPaymentsLoading(false);
      }
    }
  }, []);

  // ✅ Add loan
  const addLoan = useCallback(
    async (loanData) => {
      try {
        const response = await API.post('/loans', loanData);

        if (response.data.success) {
          // Fetch fresh data from backend
          await fetchLoans();
          await fetchDashboardData();
          toast.success(response.data.message || 'Loan created successfully');
          return {
            success: true,
            message: response.data.message || 'Loan created successfully',
            data: response.data.data,
          };
        }
      } catch (err) {
        // ✅ Handle validation errors specifically
        if (err.response?.data?.errors) {
          const errorMessages = err.response.data.errors
            .map((e) => `${e.field}: ${e.message}`)
            .join(', ');
          toast.error(errorMessages);
          return {
            success: false,
            message: errorMessages,
          };
        }

        const errorMessage = err.response?.data?.message || err.message || 'Failed to add loan';
        toast.error(errorMessage);
        return {
          success: false,
          message: errorMessage,
        };
      }
    },
    [fetchLoans]
  );

  // ✅ Delete loan
  const deleteLoan = useCallback(
    async (id) => {
      try {
        const response = await API.delete(`/loans/${id}`);

        if (response.data.success) {
          await fetchLoans();
          await fetchDashboardData();
          toast.success(response.data.message || 'Loan deleted');
          return { success: true };
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete loan');
        return { success: false };
      }
    },
    [fetchLoans]
  );

  // ✅ Update loan
  const updateLoan = useCallback(
    async (id, updatedData) => {
      try {
        const response = await API.put(`/loans/${id}`, updatedData);

        if (response.data.success) {
          await fetchLoans();
          await fetchDashboardData();
          toast.success(response.data.message || 'Loan updated');
          return { success: true };
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to update loan');
        return { success: false };
      }
      return { success: false };
    },
    [fetchLoans]
  );

  // ✅ Add Payment
  const addPayment = useCallback(
    async (paymentData) => {
      try {
        const response = await API.post('/payments', paymentData);

        if (response.data.success) {
          await fetchLoans(); // Refresh to update outstanding amounts
          await fetchPayments({ showLoading: false }); // Refresh global payments list in background
          await fetchDashboardData();
          toast.success(response.data.message || 'Payment added successfully');
          return { success: true };
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to add payment');
        return { success: false };
      }
    },
    [fetchLoans, fetchPayments]
  );

  // ✅ Update Payment
  const updatePayment = useCallback(
    async (id, data) => {
      try {
        const response = await API.put(`/payments/${id}`, data);

        if (response.data.success) {
          await fetchLoans();
          await fetchPayments({ showLoading: false });
          await fetchDashboardData();
          toast.success('Payment updated successfully');
          return { success: true };
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to update payment');
        return { success: false };
      }
    },
    [fetchLoans, fetchPayments]
  );

  // ✅ Delete Payment
  const deletePayment = useCallback(
    async (id) => {
      try {
        const response = await API.delete(`/payments/${id}`);

        if (response.data.success) {
          await fetchLoans();
          await fetchPayments({ showLoading: false });
          await fetchDashboardData();
          toast.success('Payment deleted successfully');
          return { success: true };
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete payment');
        return { success: false };
      }
    },
    [fetchLoans, fetchPayments]
  );

  // ✅ Add Topup
  const addTopup = useCallback(
    async (topupData) => {
      try {
        const response = await API.post('/topups', topupData);

        if (response.data.success) {
          await fetchLoans(); // Refresh to update principal/outstanding amounts
          await fetchDashboardData();
          toast.success(response.data.message || 'Top-up added successfully');
          return { success: true }; // Return standard success object
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to add top-up');
        return { success: false };
      }
    },
    [fetchLoans]
  );

  // ✅ Add Penalty
  const addPenalty = useCallback(
    async (penaltyData) => {
      try {
        const response = await API.post('/penalties', penaltyData);

        if (response.data.success) {
          await fetchLoans(); // Refresh to update outstanding amount
          await fetchDashboardData();
          toast.success(response.data.message || 'Penalty added successfully');
          return { success: true };
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to add penalty');
        return { success: false };
      }
    },
    [fetchLoans]
  );

  // ✅ Update Penalty
  const updatePenalty = useCallback(
    async (id, data) => {
      try {
        const response = await API.put(`/penalties/${id}`, data);

        if (response.data.success) {
          await fetchLoans();
          await fetchDashboardData();
          toast.success('Penalty updated successfully');
          return { success: true };
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to update penalty');
        return { success: false };
      }
    },
    [fetchLoans]
  );

  // ✅ Delete Penalty
  const deletePenalty = useCallback(
    async (id) => {
      try {
        const response = await API.delete(`/penalties/${id}`);

        if (response.data.success) {
          await fetchLoans();
          await fetchDashboardData();
          toast.success('Penalty deleted successfully');
          return { success: true };
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete penalty');
        return { success: false };
      }
    },
    [fetchLoans]
  );

  // ✅ Update Topup
  const updateTopup = useCallback(
    async (id, data) => {
      try {
        const response = await API.put(`/topups/${id}`, data);

        if (response.data.success) {
          await fetchLoans();
          await fetchDashboardData();
          toast.success('Topup updated successfully');
          return { success: true };
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to update topup');
        return { success: false };
      }
    },
    [fetchLoans]
  );

  // ✅ Delete Topup
  const deleteTopup = useCallback(
    async (id) => {
      try {
        const response = await API.delete(`/topups/${id}`);

        if (response.data.success) {
          await fetchLoans();
          await fetchDashboardData();
          toast.success('Topup deleted successfully');
          return { success: true };
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete topup');
        return { success: false };
      }
    },
    [fetchLoans]
  );

  // Load initial data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchLoans();
      fetchPayments({ showLoading: true });
    }
  }, [fetchLoans, fetchPayments]);

  // ✅ Wrapper to auto-refresh data when borrower is ADDED
  const handleAddBorrower = useCallback(
    async (data) => {
      const result = await addBorrower(data);
      if (result.success) {
        await fetchDashboardData(); // Update stats (Total Borrowers)
      }
      return result;
    },
    [addBorrower, fetchDashboardData]
  );

  // ✅ Wrapper to auto-refresh loans when borrower is updated
  const handleUpdateBorrower = useCallback(
    async (id, data) => {
      const result = await updateBorrower(id, data);
      if (result.success) {
        await fetchLoans(); // Refresh loans to show new borrower details (name/mobile)
        await fetchDashboardData();
      }
      return result;
    },
    [updateBorrower, fetchLoans, fetchDashboardData]
  );

  // ✅ Wrapper to auto-refresh loans when borrower is deleted (Cascading Delete)
  const handleDeleteBorrower = useCallback(
    async (id) => {
      const result = await deleteBorrower(id);
      if (result.success) {
        await fetchLoans(); // Refresh loans to remove deleted borrower's loans
        await fetchDashboardData();
      }
      return result;
    },
    [deleteBorrower, fetchLoans, fetchDashboardData]
  );

  const value = useMemo(
    () => ({
      loans,
      borrowers,
      loading,
      borrowersLoading,
      error,
      addLoan,
      fetchLoans,
      fetchBorrowers,
      setLoans,
      addBorrower: handleAddBorrower,
      updateBorrower: handleUpdateBorrower,
      deleteBorrower: handleDeleteBorrower,
      deleteLoan,
      updateLoan,
      addPayment,
      updatePayment,
      deletePayment,
      addTopup,
      addPenalty,
      updatePenalty,
      deletePenalty,
      updateTopup,
      deleteTopup,
      payments,
      paymentsLoading,
      fetchPayments,
      dashboardData,
      fetchDashboardData,
    }),
    [
      loans,
      borrowers,
      loading,
      borrowersLoading,
      error,
      addLoan,
      fetchLoans,
      fetchBorrowers,
      handleAddBorrower,
      handleUpdateBorrower,
      handleDeleteBorrower,
      deleteLoan,
      updateLoan,
      addPayment,
      updatePayment,
      deletePayment,
      addTopup,
      addPenalty,
      updatePenalty,
      deletePenalty,
      updateTopup,
      deleteTopup,
      payments,
      paymentsLoading,
      fetchPayments,
      dashboardData,
      fetchDashboardData,
    ]
  );

  return <LoanContext.Provider value={value}>{children}</LoanContext.Provider>;
};

export const useLoanContext = () => {
  const context = useContext(LoanContext);
  if (!context) {
    throw new Error('useLoanContext must be used within LoanProvider');
  }
  return context;
};
