import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import API from '../utils/api';

const BorrowerContext = createContext();

export const BorrowerProvider = ({ children }) => {
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Fetch all borrowers
  const fetchBorrowers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get('/borrowers');

      if (response.data.success) {
        console.log(`✅ Fetched ${response.data.data?.length || 0} borrowers`);
        setBorrowers(response.data.data || []);
        setError(null);
      }
    } catch (err) {
      console.error('❌ Fetch Borrowers Error:', err);
      setError(err.response?.data?.message || 'Failed to fetch borrowers');
      setBorrowers([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add borrower
  const addBorrower = async (borrowerData) => {
    try {
      const response = await API.post('/borrowers', borrowerData);

      if (response.data.success) {
        console.log('✅ POST /api/borrowers Success:', response.data.message);
        toast.success(response.data.message || 'Borrower added successfully');

        // Fetch fresh data (wait for it to complete)
        await fetchBorrowers();

        return {
          success: true,
          message: response.data.message || 'Borrower added successfully',
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

      const errorMessage = err.response?.data?.message || err.message || 'Failed to add borrower';
      console.error('❌ POST /api/borrowers Failed:', errorMessage, err.response?.data);
      toast.error(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  // ✅ Update borrower
  const updateBorrower = async (id, updatedData) => {
    try {
      const response = await API.put(`/borrowers/${id}`, updatedData);

      if (response.data.success) {
        await fetchBorrowers();
        toast.success(response.data.message || 'Borrower updated successfully');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update borrower';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // ✅ Delete borrower
  const deleteBorrower = async (id) => {
    try {
      const response = await API.delete(`/borrowers/${id}`);

      if (response.data.success) {
        await fetchBorrowers();
        toast.success(response.data.message || 'Borrower deleted successfully');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete borrower';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // Load borrowers on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchBorrowers();
    }
  }, []);

  return (
    <BorrowerContext.Provider
      value={{
        borrowers,
        loading,
        error,
        addBorrower,
        fetchBorrowers,
        setBorrowers,
        updateBorrower,
        deleteBorrower,
      }}
    >
      {children}
    </BorrowerContext.Provider>
  );
};

export const useBorrowerContext = () => {
  const context = useContext(BorrowerContext);
  if (!context) {
    throw new Error('useBorrowerContext must be used within BorrowerProvider');
  }
  return context;
};
