import { useEffect, useState } from 'react';
import API from '../utils/api';

const Borrowers = () => {
  const [borrowers, setBorrowers] = useState([]);

  const fetchBorrowers = async () => {
    const res = await API.get('/borrowers');
    setBorrowers(res.data);
  };

  useEffect(() => {
    fetchBorrowers();
  }, []);

  return (
    <div>
      <h2>Borrowers List</h2>
      <div className="table-wrapper border-blue">
        <div className="table-scroll-container">
          <table className="app-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {borrowers.map((b) => (
                <tr key={b.borrower_id}>
                  <td>{b.borrower_id}</td>
                  <td>{b.full_name}</td>
                  <td>{b.mobile}</td>
                  <td>{b.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Borrowers;
