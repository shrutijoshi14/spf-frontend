import { lazy, Suspense } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Loader from './common/Loader';
import Layout from './layout/Layout';

// Lazy Load Pages for Performance
const ForgotPassword = lazy(() => import('./pages/ForgetPassword'));
const Login = lazy(() => import('./pages/Login'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

import { AuthProvider } from './context/AuthContext.jsx';
import { BorrowerProvider } from './context/BorrowerContext';
import { LoanProvider } from './context/LoanContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './features/dashboard/components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Suspense fallback={<Loader fullScreen={true} />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* Main Dashboard Layout */}
              {/* Protected App Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <BorrowerProvider>
                      <LoanProvider>
                        <Layout />
                      </LoanProvider>
                    </BorrowerProvider>
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard activeTab="dashboard" />} />
                <Route path="/loans" element={<Dashboard activeTab="loans" />} />
                <Route path="/loans/view/:loanId" element={<Dashboard activeTab="loans" />} />
                <Route path="/borrowers" element={<Dashboard activeTab="borrowers" />} />
                <Route
                  path="/borrowers/view/:borrowerId"
                  element={<Dashboard activeTab="borrowers" />}
                />
                <Route path="/payments" element={<Dashboard activeTab="payments" />} />
                <Route path="/reports" element={<Dashboard activeTab="reports" />} />
                <Route path="/reports" element={<Dashboard activeTab="reports" />} />
                <Route path="/settings" element={<Dashboard activeTab="settings" />} />

                <Route
                  path="/settings/users"
                  element={
                    <ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN']}>
                      <Dashboard activeTab="manage-users" />
                    </ProtectedRoute>
                  }
                />

                {/* URL-based Modals (Loans) */}
                <Route
                  path="/add-loans"
                  element={<Dashboard activeTab="loans" initialModal="add-loan" />}
                />
                <Route
                  path="/loans/edit/:loanId"
                  element={<Dashboard activeTab="loans" initialModal="edit-loan" />}
                />
                <Route
                  path="/loans/delete/:loanId"
                  element={<Dashboard activeTab="loans" initialModal="delete-loan" />}
                />
                <Route
                  path="/loans/paynow/:loanId"
                  element={<Dashboard activeTab="loans" initialModal="pay-loan" />}
                />
                <Route
                  path="/loans/topup/:loanId"
                  element={<Dashboard activeTab="loans" initialModal="topup-loan" />}
                />
                <Route
                  path="/loans/penalty/:loanId"
                  element={<Dashboard activeTab="loans" initialModal="penalty-loan" />}
                />

                {/* URL-based Modals (Borrowers) */}
                <Route
                  path="/add-borrowers"
                  element={<Dashboard activeTab="borrowers" initialModal="add-borrower" />}
                />
                <Route
                  path="/borrowers/edit/:borrowerId"
                  element={<Dashboard activeTab="borrowers" initialModal="edit-borrower" />}
                />
                <Route
                  path="/borrowers/delete/:borrowerId"
                  element={<Dashboard activeTab="borrowers" initialModal="delete-borrower" />}
                />

                <Route
                  path="/dashboard/view-all"
                  element={<Dashboard activeTab="dashboard" initialModal="view-all" />}
                />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Suspense>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
