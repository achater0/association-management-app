import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/routes/ProtectedRoute';
import BureauRoute from './components/routes/BureauRoute';
import Login from './pages/auth/Login';
import SubscriberDashboard from './pages/subscriber/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

// Placeholder views for testing routing



function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Normal Subscriber Protected Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <SubscriberDashboard />
              </ProtectedRoute>
            }
          />

          {/* Bureau Administrator Protected Route */}
          <Route
            path="/admin/dashboard"
            element={
              <BureauRoute>
                <AdminDashboard />
              </BureauRoute>
            }
          />

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;