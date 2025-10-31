import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../config/api';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [paymentForm, setPaymentForm] = useState({
    accountNumber: '',
    beneficiaryAccountNumber: '',
    amount: '',
  });
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchData();
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accountsData, transactionsData] = await Promise.all([
        apiClient.get('/transactions/accounts'),
        apiClient.get('/transactions'),
      ]);
      setAccounts(accountsData);
      setTransactions(transactionsData);
      setError('');
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClick = (account) => {
    setSelectedAccount(account);
    setPaymentForm({
      accountNumber: account.accountNumber,
      beneficiaryAccountNumber: '',
      amount: '',
    });
    setShowPaymentModal(true);
    setError('');
    setSuccess('');
  };

  const handlePaymentChange = (e) => {
    setPaymentForm({
      ...paymentForm,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiClient.post('/transactions', {
        accountNumber: paymentForm.accountNumber,
        beneficiaryAccountNumber: paymentForm.beneficiaryAccountNumber,
        amount: parseFloat(paymentForm.amount),
      });

      setSuccess('Payment successful!');
      setPaymentForm({
        accountNumber: paymentForm.accountNumber,
        beneficiaryAccountNumber: '',
        amount: '',
      });
      
      await fetchData();
      
      setTimeout(() => {
        setShowPaymentModal(false);
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-EU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const formatAccountNumber = (accountNumber) => {
    if (!accountNumber || accountNumber.length < 7) return accountNumber;
    
    const withoutPrefix = accountNumber.substring(3);
    const countryCode = withoutPrefix.substring(0, 2);
    const checkDigits = withoutPrefix.substring(2, 4);
    const remaining = withoutPrefix.substring(4);
    const groups = remaining.match(/.{1,4}/g) || [];
    
    return `SWB ${countryCode} ${checkDigits} ${groups.join(' ')}`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-white/70">Manage your accounts and transactions</p>
      </div>

      {error && !showPaymentModal && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400">
          {error}
        </div>
      )}

      {/* Accounts Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Your Accounts</h2>
        {accounts.length === 0 ? (
          <div className="bg-white/5 border border-white/20 rounded-xl p-8 text-center">
            <p className="text-white/70 mb-4">No accounts found</p>
            <p className="text-white/50 text-sm">Contact support to create your first account</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/20 rounded-xl p-6 hover:border-white/30 transition"
              >
                <div className="mb-4">
                  <p className="text-white/70 text-sm mb-1">Account Number</p>
                  <p className="font-mono text-sm break-all">
                    {formatAccountNumber(account.accountNumber)}
                  </p>
                </div>
                <div className="mb-4">
                  <p className="text-white/70 text-sm mb-1">Balance</p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(account.balance)}
                  </p>
                </div>
                <button
                  onClick={() => handlePaymentClick(account)}
                  className="w-full px-4 py-3 rounded-xl bg-ui-surface font-semibold hover:opacity-90 transition"
                >
                  Make Payment
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Transactions Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Transaction History</h2>
        {transactions.length === 0 ? (
          <div className="bg-white/5 border border-white/20 rounded-xl p-8 text-center">
            <p className="text-white/70 mb-2">No transactions yet</p>
            <p className="text-white/50 text-sm">Make your first payment to see transactions here</p>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/20 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">From Account</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">To Account</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4">
                        {transaction.type === 'incoming' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/50">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                            Incoming
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-red-500/10 text-red-400 border border-red-500/50">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                            </svg>
                            Outgoing
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-white/70 whitespace-nowrap">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono">
                        <div className="max-w-xs overflow-hidden text-ellipsis">
                          {formatAccountNumber(transaction.accountNumber)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono">
                        <div className="max-w-xs overflow-hidden text-ellipsis">
                          {formatAccountNumber(transaction.beneficiaryAccountNumber)}
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-right text-sm font-semibold whitespace-nowrap ${
                        transaction.type === 'incoming' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.type === 'incoming' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Payment Modal - same as before */}
      {showPaymentModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPaymentModal(false);
            }
          }}
        >
          <div className="bg-neutral-900 border border-white/20 rounded-xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Make Payment</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-white/70 hover:text-white transition"
                type="button"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/50 text-green-400 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">From Account</label>
                <input
                  type="text"
                  value={formatAccountNumber(paymentForm.accountNumber)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 font-mono text-sm"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Available Balance</label>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(selectedAccount?.balance || 0)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Beneficiary Account Number
                </label>
                <input
                  type="text"
                  name="beneficiaryAccountNumber"
                  value={paymentForm.beneficiaryAccountNumber}
                  onChange={handlePaymentChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 focus:border-white/40 focus:outline-none transition font-mono text-sm"
                  placeholder="SWBLV47BANK00001234567890"
                  required
                  disabled={paymentLoading}
                />
                <p className="mt-1 text-xs text-white/50">Enter the full account number without spaces</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Amount (EUR)</label>
                <div className="relative">
                  <input
                    type="number"
                    name="amount"
                    value={paymentForm.amount}
                    onChange={handlePaymentChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 focus:border-white/40 focus:outline-none transition"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    max={selectedAccount?.balance}
                    required
                    disabled={paymentLoading}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 text-sm">
                    EUR
                  </span>
                </div>
                <p className="mt-1 text-xs text-white/50">
                  Maximum: {formatCurrency(selectedAccount?.balance || 0)}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/20 font-semibold hover:bg-white/10 transition"
                  disabled={paymentLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentLoading}
                  className="flex-1 px-4 py-3 rounded-xl bg-ui-surface font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Send Payment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}