import React from 'react';

const ReceiptModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptNo = `REC-${new Date().getFullYear()}-${String(transaction.id || '001').padStart(4, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full p-6 space-y-6 print:shadow-none print:border-none print:p-0 print:m-0 print:w-full print:max-w-none">
        
        {/* Action Header (Hidden during Print) */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 print:hidden">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Official Payment Receipt</h3>
            <p className="text-xs text-slate-500">Preview and print or download receipt as PDF</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl shadow-sm transition flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>

        {/* --- PRINTABLE RECEIPT BODY --- */}
        <div className="p-8 border border-slate-200 rounded-2xl bg-white space-y-8 print:border-2 print:border-slate-800 print:rounded-none print:p-6">
          
          {/* Association Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  A
                </div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">ASSOCIATION AL KHAIR</h1>
              </div>
              <p className="text-xs text-slate-500">Siège Social: Douar El Khair, Maroc</p>
              <p className="text-xs text-slate-500">Email: contact@association.ma | Tél: +212 5 22 00 00 00</p>
            </div>
            
            <div className="text-right">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 print:bg-transparent print:border-slate-300">
                REÇU DE PAIEMENT
              </span>
              <p className="text-sm font-mono font-bold text-slate-800 mt-2">{receiptNo}</p>
              <p className="text-xs text-slate-500">Date: {transaction.date || new Date().toISOString().split('T')[0]}</p>
            </div>
          </div>

          {/* Member & Payment Details */}
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm space-y-2 print:bg-transparent print:border-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500 text-xs">Reçu de (Member):</span>
                <span className="font-semibold text-slate-900">{transaction.user_name || transaction.userName || 'Adhérent de l\'Association'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-xs">Email / Identifiant:</span>
                <span className="font-mono text-xs text-slate-700">{transaction.user_email || transaction.userEmail || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-xs">Motif du Paiement:</span>
                <span className="font-semibold text-slate-900">{transaction.category || 'Cotisation Annuelle'}</span>
              </div>
              {transaction.description && (
                <div className="flex justify-between">
                  <span className="text-slate-500 text-xs">Réf / Description:</span>
                  <span className="text-xs text-slate-700">{transaction.description}</span>
                </div>
              )}
            </div>

            {/* Amount Banner */}
            <div className="flex justify-between items-center bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 print:bg-transparent print:border-2 print:border-slate-900">
              <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">Montant Réglé</span>
              <span className="text-2xl font-black text-emerald-700 print:text-slate-900">
                {transaction.amount} MAD
              </span>
            </div>

            {/* Uploaded Proof (if any) */}
            {transaction.document_path && (
              <div className="mt-3 text-sm">
                <span className="text-xs text-slate-500">Proof Document:</span>
                <div className="mt-2">
                  {transaction.document_path.endsWith('.pdf') ? (
                    <a href={transaction.document_path} target="_blank" rel="noreferrer" className="text-emerald-600 underline">Open PDF Document</a>
                  ) : (
                    <img src={transaction.document_path} alt="proof" className="max-w-full h-auto rounded-lg border" />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Official Signature & Cachet Section */}
          <div className="pt-8 border-t border-slate-200 flex justify-between items-end min-h-[140px]">
            <div className="text-xs text-slate-400 space-y-1">
              <p>Ce reçu est délivré pour servir et valoir ce que de droit.</p>
              <p className="font-mono text-[10px]">DocRef: {receiptNo}-{transaction.id}</p>
            </div>

            {/* Cachet et Signature Placeholder */}
            <div className="text-center w-56 p-3 border border-dashed border-slate-300 rounded-xl space-y-8 print:border-slate-400">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                Cachet & Signature du Trésorier
              </span>
              
              {/* Visual Stamp Simulation */}
              <div className="relative inline-block opacity-80 pointer-events-none">
                <div className="w-24 h-24 border-2 border-dashed border-emerald-700 rounded-full flex items-center justify-center text-center p-1 transform -rotate-12 mx-auto">
                  <span className="text-[9px] font-bold text-emerald-800 uppercase leading-tight">
                    ASSOCIATION AL KHAIR<br />★ PAYÉ ★<br />BUREAU
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ReceiptModal;