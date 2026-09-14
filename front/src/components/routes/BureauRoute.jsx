import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Decode JWT payload without external deps
const parseJwt = (token) => {
  try {
    const payload = token.split('.')[1];
    const padded = payload.padEnd(payload.length + (4 - (payload.length % 4)) % 4, '=');
    const decoded = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
};

const BureauRoute = ({ children }) => {
  const { token, user } = useAuth();

  if (!token) return <Navigate to="/login" replace />;

  // Prefer authoritative flag from token payload (in case stored `user` is stale)
  const payload = parseJwt(token);
  const tokenIsBureau = payload?.isBureau;

  const effectiveIsBureau = tokenIsBureau || user?.isBureau;

  if (!effectiveIsBureau) return <Navigate to="/dashboard" replace />; // Subscriber default home

  return children;
};

export default BureauRoute;