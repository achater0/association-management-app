import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserBalance } from '../../services/userService';
import { getProjects } from '../../services/projectService';
import Navbar from '../../components/layout/Navbar';

const Dashboard = () => {
  const { user } = useAuth();
  const [financials, setFinancials] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.id) {
          const balanceData = await getUserBalance(user.id);
          setFinancials(balanceData.financials);
        }
        const projectsData = await getProjects();
        setProjects(projectsData.projects || []);
      } catch (err) {
        setError('Failed to fetch user financial record.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-3 text-slate-500 text-sm">
            <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading portal data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner Section */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, <span className="text-emerald-600">{user?.name}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track your annual membership dues, contributions, and active association projects.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Financial Stat Cards */}
        {financials && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Required Dues */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Annual Dues</span>
              <div className="text-2xl font-bold text-slate-900 mt-2">
                {financials.annual_dues_required} <span className="text-xs font-normal text-slate-500">MAD</span>
              </div>
            </div>

            {/* Total Paid */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Paid</span>
              <div className="text-2xl font-bold text-emerald-600 mt-2">
                {financials.total_dues_paid} <span className="text-xs font-normal text-slate-500">MAD</span>
              </div>
            </div>

            {/* Amount Due */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount Due</span>
              <div className={`text-2xl font-bold mt-2 ${financials.amount_due > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                {financials.amount_due} <span className="text-xs font-normal text-slate-500">MAD</span>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
              <div className="mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                  financials.payment_status === 'Up to date'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-2 ${financials.payment_status === 'Up to date' ? 'bg-emerald-600' : 'bg-amber-500'}`}></span>
                  {financials.payment_status}
                </span>
              </div>
            </div>

          </div>
        )}

        {/* Ledger Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900">Contribution Ledger</h2>
            <p className="text-slate-500 text-xs">History of payments and project donations</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {financials?.history && financials.history.length > 0 ? (
                  financials.history.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 text-slate-500 text-xs">{tx.date}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {tx.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{tx.description || '—'}</td>
                      <td className="px-6 py-4 text-right font-semibold text-emerald-600">
                        +{tx.amount} MAD
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-6 text-center text-slate-400 text-xs">
                      No contribution records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Association Projects */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">Association Projects</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.length > 0 ? (
              projects.map((proj) => (
                <div key={proj.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-slate-900">{proj.title}</h3>
                      <span className="text-[11px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-medium">
                        {proj.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      {proj.description || 'No description provided.'}
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                    <span>Budget</span>
                    <strong className="text-slate-900 font-bold">{proj.budget} MAD</strong>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No active projects registered yet.</p>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;