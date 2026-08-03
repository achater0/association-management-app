import API from './api';

// Fetch treasury overall summary (Total Income, Total Expense, Net Balance)
export const getTreasurySummary = async () => {
  const response = await API.get('/transactions/summary');
  return response.data; // Returns { summary: { total_income, total_expense, net_balance } }
};

// Log a new financial transaction (Cotisation, Don, Facture, etc.)
export const createTransaction = async (transactionData) => {
  const response = await API.post('/transactions', transactionData);
  return response.data;
};

// Fetch all transactions ledger
export const getTransactions = async () => {
  const response = await API.get('/transactions');
  return response.data; // Returns { transactions: [...] }
};