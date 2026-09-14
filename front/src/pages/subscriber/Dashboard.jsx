import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserBalance, getUser, uploadCIN, uploadPaymentProof } from '../../services/userService';
import { getProjects, getLatestAnnualReport } from '../../services/projectService';
import { getProjectTransactions } from '../../services/transactionService';
import ReceiptModal from '../../components/receipts/ReceiptModal';

// Helper to open file in new tab
const openFile = (url) => {
  if (!url) return;
  const win = window.open(url, '_blank');
  if (win) win.focus();
};
import Navbar from '../../components/layout/Navbar';

const Dashboard = () => {
  const { user } = useAuth();
  const [financials, setFinancials] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [projectDetails, setProjectDetails] = useState(null);
  const [showProject, setShowProject] = useState(false);
  const [profile, setProfile] = useState(null);
  const [cinFile, setCinFile] = useState(null);
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [annualReport, setAnnualReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.id) {
          const balanceData = await getUserBalance(user.id);
          setFinancials(balanceData.financials);
          const userResp = await getUser(user.id);
          setProfile(userResp.user || null);
        }
        const [projectsData, annualReportData] = await Promise.all([
          getProjects(),
          getLatestAnnualReport().catch(() => null)
        ]);
        setProjects(projectsData.projects || []);
        setAnnualReport(annualReportData?.report || null);
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

        {/* Project Report Modal */}
        {showProject && projectDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl max-w-3xl w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">{projectDetails.project.title} — Expense Report</h3>
                <button onClick={() => { setShowProject(false); setProjectDetails(null); }} className="text-sm text-slate-500">Close</button>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {projectDetails.transactions.length > 0 ? (
                  <table className="w-full text-sm text-slate-600">
                    <thead className="text-xs text-slate-500">
                      <tr>
                        <th className="text-left">Date</th>
                        <th className="text-left">Category</th>
                        <th className="text-left">Description</th>
                        <th className="text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="mt-2">
                      {projectDetails.transactions.map((t) => (
                        <tr key={t.id} className="border-t border-slate-100">
                          <td className="py-2 text-xs text-slate-500">{t.date}</td>
                          <td className="py-2 font-medium text-slate-900">{t.category}</td>
                          <td className="py-2 text-slate-500">{t.description}</td>
                          <td className="py-2 text-right font-semibold text-emerald-600">{t.amount} MAD</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-sm text-slate-500">No expense entries found for this project.</div>
                )}
              </div>
            </div>
          </div>
        )}
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

        {message.text && (
          <div className={`p-4 rounded-xl text-sm font-medium border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
            {message.text}
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
        {/* Profile & CIN Upload */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900">Your Profile & ID</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2">
              <div className="text-sm text-slate-600">Name</div>
              <div className="font-semibold text-slate-900">{profile?.name || user?.name}</div>
              <div className="text-xs text-slate-500 mt-2">Email: {profile?.email || user?.email}</div>
              <div className="text-xs text-slate-500 mt-1">Phone: {profile?.phone || '—'}</div>
              <div className="text-xs text-slate-500 mt-1">CIN: {profile?.cin_number || 'Not provided'}</div>
            </div>
            <div className="col-span-1">
              {profile?.cin_file ? (
                <div className="text-sm">
                  <div className="text-xs text-slate-500">Uploaded CIN</div>
                  <a href={profile.cin_file} target="_blank" rel="noreferrer" className="text-emerald-600 underline">View Document</a>
                </div>
              ) : (
                <div className="text-sm text-slate-500">No CIN uploaded yet.</div>
              )}

              <div className="mt-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">Upload CIN (image/PDF)</label>
                <input type="file" accept="image/*,application/pdf" onChange={(e) => setCinFile(e.target.files[0] || null)} className="text-sm" />
                <div className="mt-2 text-right">
                  <button
                    onClick={async () => {
                      if (!cinFile) return setMessage({ type: 'error', text: 'Select a file first.' });
                      try {
                        setMessage({ type: 'info', text: 'Uploading...' });
                        const resp = await uploadCIN(user.id, cinFile);
                        setProfile(resp.user || profile);
                        setCinFile(null);
                        setMessage({ type: 'success', text: 'CIN uploaded successfully.' });
                      } catch (err) {
                        setMessage({ type: 'error', text: 'Upload failed.' });
                      }
                    }}
                    className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-xl"
                  >
                    Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900">Contribution Ledger</h2>
            <p className="text-slate-500 text-xs">History of annual dues and project donations (most recent first)</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-right">Actions</th>
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
                      <td className="px-6 py-4 text-right font-semibold text-emerald-600">+{tx.amount} MAD</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {tx.document_path && (
                          <button
                            onClick={() => openFile(tx.document_path)}
                            className="text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-700"
                          >
                            View Proof
                          </button>
                        )}
                        <button
                          onClick={() => { setSelectedTx(tx); setShowReceipt(true); }}
                          className="text-xs px-2 py-1 bg-emerald-600 text-white rounded-md"
                        >
                          Print / Download
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-6 text-center text-slate-400 text-xs">
                      No contribution records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Annual Bureau Report */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900">Annual Bureau Report</h2>
          <p className="text-xs text-slate-500 mt-1">Official yearly report published by the Bureau. Available to all subscribers.</p>
          <div className="mt-4">
            {annualReport?.file_path ? (
              <button
                onClick={() => openFile(annualReport.file_path)}
                className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-xl"
              >
                View / Download Report ({annualReport.year})
              </button>
            ) : (
              <button disabled className="px-3 py-1.5 bg-slate-200 text-slate-500 text-sm rounded-xl cursor-not-allowed">
                Report not published yet
              </button>
            )}
            <p className="text-xs text-slate-400 mt-2">If the report is not available, please contact the Bureau.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900">Payment Proof Submission</h2>
          <p className="text-xs text-slate-500 mt-1">Upload proof of your annual dues or transfer as validation evidence.</p>
          <div className="mt-4 flex flex-col md:flex-row gap-3 items-start md:items-center">
            <input type="file" accept="image/*,application/pdf" onChange={(e) => setPaymentProofFile(e.target.files[0] || null)} className="text-sm" />
            <button
              onClick={async () => {
                if (!paymentProofFile) return setMessage({ type: 'error', text: 'Select a payment proof file first.' });
                try {
                  const resp = await uploadPaymentProof(user.id, paymentProofFile);
                  setProfile(resp.user || profile);
                  setPaymentProofFile(null);
                  setMessage({ type: 'success', text: 'Payment proof submitted successfully.' });
                } catch (err) {
                  setMessage({ type: 'error', text: 'Payment proof submission failed.' });
                }
              }}
              className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-xl"
            >
              Submit Proof
            </button>
          </div>
          {profile?.payment_proof && (
            <div className="mt-3 text-sm text-slate-600">
              Existing proof: <button onClick={() => openFile(profile.payment_proof)} className="text-emerald-600 underline">Open file</button>
            </div>
          )}
        </div>
        
        {/* Receipt Modal */}
        {showReceipt && (
          <ReceiptModal transaction={selectedTx} onClose={() => { setShowReceipt(false); setSelectedTx(null); }} />
        )}


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
                  <div className="mt-3 flex items-center space-x-2">
                    <button
                      onClick={async () => {
                        try {
                          setShowProject(true);
                          const resp = await getProjectTransactions(proj.id);
                          setProjectDetails({ project: proj, transactions: resp.transactions || [] });
                        } catch (err) {
                          setMessage({ type: 'error', text: 'Failed to load project report.' });
                          setShowProject(false);
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-sm rounded-md"
                    >
                      View Expense Report
                    </button>
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