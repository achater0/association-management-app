import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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

const Navbar = () => {
  const { user, logout, token } = useAuth();
  const payload = token ? parseJwt(token) : null;
  const isBureau = payload?.isBureau || user?.isBureau;
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              A
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900">
                Association<span className="text-emerald-600">Hub</span>
              </span>
            </div>

            {isBureau && (
              <span className="ml-2 bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full border border-emerald-200 font-medium">
                Bureau Admin
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-slate-600 hover:text-slate-900 font-medium px-3 py-1 rounded-md hover:bg-slate-50 transition"
            >
              Dashboard
            </button>

            {isBureau && (
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="text-sm text-emerald-600 hover:text-emerald-800 font-semibold px-3 py-1 rounded-md border border-emerald-100 hover:bg-emerald-50 transition"
              >
                Admin
              </button>
            )}
          </div>

          {/* User Profile & Sign Out */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
                {user?.name}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
            >
              Sign out
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;