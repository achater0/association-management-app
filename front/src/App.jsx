import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/routes/ProtectedRoute';
import BureauRoute from './components/routes/BureauRoute';
import Login from './pages/auth/Login';
import SubscriberDashboard from './pages/subscriber/Dashboard';

// Placeholder views for testing routing


const AdminDashboard = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold text-indigo-600">Bureau Admin Dashboard</h1>
    <p>Treasury overview, member manager, and project controls.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Route */}
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