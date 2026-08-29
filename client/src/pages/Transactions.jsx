import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Download, MessageCircle, FileText, Calendar, Filter, Clock } from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import { listTransactions } from '../services/transactionService';
import { downloadBill, sendBillWhatsApp } from '../services/billService';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDateTime } from '../utils/formatDate';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import Badge from '../components/common/Badge.jsx';
import Skeleton from '../components/common/Skeleton.jsx';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await listTransactions({ search, type: typeFilter, limit: 100 });
      setTransactions(data.data.transactions);
    } catch (err) {
      // quiet error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [search, typeFilter]);

  const handleDownload = async (tx) => {
    try {
      await downloadBill(tx._id, `${tx.receiptNumber}.pdf`);
      toast.success('PDF download initiated');
    } catch (err) {
      toast.error('Failed to download PDF');
    }
  };

  const handleWhatsApp = async (tx) => {
    try {
      const { data } = await sendBillWhatsApp(tx._id);
      if (data.data.mode === 'twilio') {
        toast.success('Sent via WhatsApp');
      } else if (data.data.whatsappWebUrl) {
        window.open(data.data.whatsappWebUrl, '_blank');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send WhatsApp message');
    }
  };

  return (
    <Layout title="Transaction Ledger">
      <div className="space-y-6">
        
        {/* Title Description */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Ledger History</h2>
            <p className="text-sm text-slate-400 mt-0.5">Chronological record of all shop credit and payments.</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 animate-slide-up delay-1">
          <div className="flex-1">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions by customer name..."
              icon={Search}
            />
          </div>
          <div className="space-y-1.5 shrink-0">
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)} 
              className="input sm:w-48 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-brand-500"
            >
              <option value="">All Transactions</option>
              <option value="CREDIT">Credit Only (Udhaar)</option>
              <option value="PAYMENT">Payments Only (Mila)</option>
            </select>
          </div>
        </div>

        {/* List Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton variant="rect" className="h-32" />
            <Skeleton variant="rect" className="h-32" />
            <Skeleton variant="rect" className="h-32" />
            <Skeleton variant="rect" className="h-32" />
          </div>
        ) : transactions.length === 0 ? (
          <Card animate={true} delayIdx={2} hoverable={false} className="text-center py-16 max-w-md mx-auto space-y-4 bg-white">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400 border border-slate-100/50">
              <Clock size={24} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-800">No transactions found</h3>
              <p className="text-xs text-slate-400 leading-relaxed px-6">
                Try clearing search filters or add a new entry via the dashboard voice recorder.
              </p>
            </div>
          </Card>
        ) : (
          /* Cards list */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transactions.map((tx, idx) => {
              const isCredit = tx.type === 'CREDIT';
              return (
                <Card 
                  key={tx._id} 
                  delayIdx={idx} 
                  hoverable={true}
                  className="flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-xs text-slate-600">
                          {tx.customerId?.name ? tx.customerId.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm leading-tight">{tx.customerId?.name || 'Unknown'}</p>
                          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">{formatDateTime(tx.createdAt)}</p>
                        </div>
                      </div>
                      
                      <Badge variant={isCredit ? 'danger' : 'success'}>
                        {tx.type}
                      </Badge>
                    </div>

                    {/* Transaction Note / description details */}
                    {tx.description && (
                      <p className="text-xs text-slate-500 italic bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 font-medium">
                        "{tx.description}"
                      </p>
                    )}

                    {/* Amount & balances spec detail */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100/60 space-y-2 text-xs font-semibold text-slate-500">
                      <div className="flex justify-between items-center">
                        <span>Amount:</span>
                        <span className={`font-extrabold text-sm ${isCredit ? 'text-rose-600' : 'text-sky-600'}`}>
                          {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </div>
                      
                      {tx.balanceAfter !== undefined && (
                        <div className="flex justify-between items-center border-t border-slate-100/50 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <span>Balance after:</span>
                          <span className="text-slate-700">{formatCurrency(tx.balanceAfter)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex justify-between items-center mt-4 pt-3.5 border-t border-slate-50 text-xs text-slate-400 font-semibold">
                    <span>Receipt #{tx.receiptNumber}</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDownload(tx)} 
                        className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50/30 transition-colors active:scale-95"
                        title="Download PDF Receipt"
                      >
                        <Download size={15} />
                      </button>
                      <button 
                        onClick={() => handleWhatsApp(tx)} 
                        className="p-2 rounded-xl text-slate-400 hover:text-sky-600 hover:bg-sky-50/30 transition-colors active:scale-95"
                        title="Share on WhatsApp"
                      >
                        <MessageCircle size={15} />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

      </div>
    </Layout>
  );
}
