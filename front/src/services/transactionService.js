import API from './api';

// Fetch treasury overall summary (Total Income, Total Expense, Net Balance)
export const getTreasurySummary = async () => {
  const response = await API.get('/transactions/summary');
  return response.data; // Returns { summary: { total_income, total_expense, net_balance } }
};

// Log a new financial transaction (Cotisation, Don, Facture, etc.)
export const createTransaction = async (transactionData) => {
  // If any file is included, send as multipart/form-data (supports 'document' and 'bank_proof')
  const hasDocument = transactionData.document instanceof File || transactionData.document instanceof Blob;
  const hasBankProof = transactionData.bank_proof instanceof File || transactionData.bank_proof instanceof Blob;

  if (hasDocument || hasBankProof) {
    const form = new FormData();
    Object.keys(transactionData).forEach((key) => {
      if (transactionData[key] !== undefined && transactionData[key] !== null && key !== 'document' && key !== 'bank_proof') {
        form.append(key, transactionData[key]);
      }
    });
    if (hasDocument) form.append('document', transactionData.document);
    if (hasBankProof) form.append('bank_proof', transactionData.bank_proof);

    const response = await API.post('/transactions', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  }

  const response = await API.post('/transactions', transactionData);
  return response.data;
};

// Fetch all transactions ledger
export const getTransactions = async () => {
  const response = await API.get('/transactions');
  return response.data; // Returns { transactions: [...] }
};

// Fetch transactions for a specific project (accessible to authenticated users)
export const getProjectTransactions = async (projectId) => {
  const response = await API.get(`/transactions/project/${projectId}`);
  return response.data; // Returns { transactions: [...] }
};