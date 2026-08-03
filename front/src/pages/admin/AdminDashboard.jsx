import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import ReceiptModal from '../../components/receipts/ReceiptModal';
import { getUsers, updateUserRole, createUser } from '../../services/userService';
import { getProjects, createProject } from '../../services/projectService';
import { createTransaction, getTreasurySummary, getTransactions } from '../../services/transactionService';

const BUREAU_ROLES = [
  'Président',
  'Vice-président',
  'Trésorier',
  'Vice-trésorier',
  'Secrétaire général',
  'Vice-secrétaire général',
  'Conseiller',
  'Abonné'
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('treasury'); // 'treasury' | 'projects' | 'members'
  
  // Data States
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ total_income: 0, total_expense: 0, net_balance: 0 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedTx, setSelectedTx] = useState(null); // State for Receipt Modal

  // Form States
  const [txForm, setTxForm] = useState({
    type: 'Income',
    amount: '',
    category: 'Cotisation',
    description: '',
    user_id: '',
    project_id: '',
    proof_url: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [projectForm, setProjectForm] = useState({ title: '', description: '', budget: '' });
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'Abonné' });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [usersData, projectsData, summaryData, txData] = await Promise.all([
        getUsers(),
        getProjects(),
        getTreasurySummary(),
        getTransactions()
      ]);
      setUsers(usersData.users || []);
      setProjects(projectsData.projects || []);
      setSummary(summaryData.summary || { total_income: 0, total_expense: 0, net_balance: 0 });
      setTransactions(txData.transactions || []);
    } catch (err) {
      showMessage('error', 'Failed to load administration data.');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // Handlers
  const handleLogTransaction = async (e) => {
    e.preventDefault();
    try {
      await createTransaction(txForm);
      showMessage('success', 'Transaction successfully recorded in treasury ledger.');
      setTxForm({
        type: 'Income',
        amount: '',
        category: 'Cotisation',
        description: '',
        user_id: '',
        project_id: '',
        proof_url: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchAllData();
    } catch (err) {
      showMessage('error', 'Failed to log transaction.');
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await createProject(projectForm);
      showMessage('success', 'New association project created.');
      setProjectForm({ title: '', description: '', budget: '' });
      fetchAllData();
    } catch (err) {
      showMessage('error', 'Failed to create project.');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createUser(userForm);
      showMessage('success', 'Member account successfully registered.');
      setUserForm({ name: '', email: '', role: 'Abonné' });
      fetchAllData();
    } catch (err) {
      showMessage('error', 'Failed to add new member.');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      showMessage('success', 'Member role updated successfully.');
      fetchAllData();
    } catch (err) {
      showMessage('error', 'Failed to update member role.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-3 text-slate-500 text-sm">
            <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading admin console...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Page Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Bureau Console</span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Treasury & Administration</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage financial operations, projects, and member assignments</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setActiveTab('treasury')}
              className={`px-4 py-2 rounded-lg transition ${activeTab === 'treasury' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Treasury & Invoices
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 rounded-lg transition ${activeTab === 'projects' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Projects & Committees
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 rounded-lg transition ${activeTab === 'members' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Members & Roles
            </button>
          </div>
        </div>

        {/* Global Alert Notification */}
        {message.text && (
          <div className={`p-4 rounded-xl text-sm font-medium border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
            {message.text}
          </div>
        )}

        {/* TAB 1: TREASURY & INVOICE LOGGING */}
        {activeTab === 'treasury' && (
          <div className="space-y-6">
            
            {/* Overall Treasury Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Income</span>
                <div className="text-2xl font-bold text-emerald-600 mt-1">+{summary.total_income} MAD</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Expenses</span>
                <div className="text-2xl font-bold text-rose-600 mt-1">-{summary.total_expense} MAD</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Bank Balance</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">{summary.net_balance} MAD</div>
              </div>
            </div>

            {/* Log Operation Form */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Log Treasury Operation</h2>
                <p className="text-xs text-slate-500">Record member contributions, supplier invoices, or project expenses</p>
              </div>

              <form onSubmit={handleLogTransaction} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Operation Type</label>
                  <select
                    value={txForm.type}
                    onChange={(e) => setTxForm({ ...txForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Income">Income (Entrée)</option>
                    <option value="Expense">Expense (Dépense)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (MAD)</label>
                  <input
                    type="number"
                    required
                    value={txForm.amount}
                    onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                    placeholder="e.g. 500"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={txForm.category}
                    onChange={(e) => setTxForm({ ...txForm, category: e.target.value })}
                    placeholder="Cotisation, Don, Facture, Forage, etc."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Associated Member (Optional)</label>
                  <select
                    value={txForm.user_id}
                    onChange={(e) => setTxForm({ ...txForm, user_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  >
                    <option value="">-- Select Member --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Associated Project (Optional)</label>
                  <select
                    value={txForm.project_id}
                    onChange={(e) => setTxForm({ ...txForm, project_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  >
                    <option value="">-- Select Project --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Operation Date</label>
                  <input
                    type="date"
                    required
                    value={txForm.date}
                    onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Notes</label>
                  <input
                    type="text"
                    value={txForm.description}
                    onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                    placeholder="e.g. Reçu N° 402, Facture Fournisseur Ciment, Chèque N° 908122"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Proof Link / Document URL (Optional)</label>
                  <input
                    type="url"
                    value={txForm.proof_url}
                    onChange={(e) => setTxForm({ ...txForm, proof_url: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="md:col-span-3 text-right">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm shadow-sm transition"
                  >
                    Record Operation
                  </button>
                </div>
              </form>
            </div>

            {/* Transactions Ledger Table & Receipt Trigger */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200">
                <h3 className="text-base font-bold text-slate-900">Recent Transactions & Receipts</h3>
                <p className="text-xs text-slate-500">View logged income, expenses, and issue official receipts</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Member / Description</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {transactions.length > 0 ? (
                      transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                          <td className="px-6 py-4 text-xs text-slate-500">{tx.date}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${
                              tx.type === 'Income' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-900">{tx.category}</td>
                          <td className="px-6 py-4 text-xs text-slate-600">
                            <div>{tx.user_name || 'N/A'}</div>
                            <div className="text-slate-400">{tx.description || '—'}</div>
                          </td>
                          <td className={`px-6 py-4 font-bold ${tx.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {tx.type === 'Income' ? '+' : '-'}{tx.amount} MAD
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setSelectedTx(tx)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition"
                            >
                              📄 Receipt
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-6 text-center text-slate-400 text-xs">
                          No transactions recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: PROJECTS & COMMITTEES */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            
            {/* Create Project Form */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Initiate New Association Project</h2>
                <p className="text-xs text-slate-500">Create initiatives like well drilling, mosque renovation, or widow support</p>
              </div>

              <form onSubmit={handleCreateProject} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title</label>
                  <input
                    type="text"
                    required
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    placeholder="e.g. Forage de Puits - Douar El Khair"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Allocated Budget (MAD)</label>
                  <input
                    type="number"
                    required
                    value={projectForm.budget}
                    onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                    placeholder="e.g. 25000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Scope</label>
                  <textarea
                    rows="2"
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    placeholder="Brief description of project objectives and scope..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="md:col-span-3 text-right">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm shadow-sm transition"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>

            {/* Active Projects Directory */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200">
                <h3 className="text-base font-bold text-slate-900">Active Association Initiatives</h3>
              </div>
              <div className="divide-y divide-slate-200">
                {projects.map((p) => (
                  <div key={p.id} className="p-5 flex justify-between items-center hover:bg-slate-50 transition">
                    <div>
                      <h4 className="font-bold text-slate-900">{p.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{p.description || 'No description provided.'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                        Budget: {p.budget} MAD
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: MEMBERS & ROLE MANAGEMENT */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            
            {/* Create Member Form */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Add New Subscriber / Member</h2>
                <p className="text-xs text-slate-500">Register new adherents to the association database</p>
              </div>

              <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    placeholder="e.g. Mohamed Alami"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="member@association.ma"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Association Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  >
                    {BUREAU_ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-3 text-right">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm shadow-sm transition"
                  >
                    Add Member
                  </button>
                </div>
              </form>
            </div>

            {/* Member Directory & Role Modification Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200">
                <h3 className="text-base font-bold text-slate-900">Association Member Directory</h3>
                <p className="text-xs text-slate-500">Update roles (Président, Trésorier, Secrétaire, Abonné)</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Member Name</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Current Role</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {users.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-6 py-4 font-semibold text-slate-900">{m.name}</td>
                        <td className="px-6 py-4 text-slate-500 text-xs">{m.email}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${m.role === 'Abonné' ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                            {m.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <select
                            value={m.role}
                            onChange={(e) => handleRoleChange(m.id, e.target.value)}
                            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-600"
                          >
                            {BUREAU_ROLES.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Render Receipt Modal when a transaction is selected */}
      {selectedTx && (
        <ReceiptModal
          transaction={{
            ...selectedTx,
            user_name: selectedTx.user_name || userForm.name,
            user_email: selectedTx.user_email || userForm.email
          }}
          onClose={() => setSelectedTx(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;