import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const BureauRoute = ({ children }) => {
  const { token, isBureau } = useAuth();

  if (!token) return <Navigate to="/login" replace />;
  if (!isBureau) return <Navigate to="/dashboard" replace />; // Subscriber default home

  return children;
};

export default BureauRoute;