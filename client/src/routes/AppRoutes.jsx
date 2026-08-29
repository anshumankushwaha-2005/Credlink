import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute.jsx';

import Landing from '../pages/Landing.jsx';
import Login from '../pages/Login.jsx';
import VerifyOTP from '../pages/VerifyOTP.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Customers from '../pages/Customers.jsx';
import CustomerDetails from '../pages/CustomerDetails.jsx';
import VoiceTransaction from '../pages/VoiceTransaction.jsx';
import Transactions from '../pages/Transactions.jsx';
import Bills from '../pages/Bills.jsx';
import Reports from '../pages/Reports.jsx';
import Profile from '../pages/Profile.jsx';
import NotFound from '../pages/NotFound.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
      <Route path="/customers/:id" element={<ProtectedRoute><CustomerDetails /></ProtectedRoute>} />
      <Route path="/voice" element={<ProtectedRoute><VoiceTransaction /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
      <Route path="/bills" element={<ProtectedRoute><Bills /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
