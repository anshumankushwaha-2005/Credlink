import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Mic, FileText, MessageCircle, Phone, MapPin, TrendingUp, TrendingDown, Clock, Check, X } from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import { useAuth } from '../hooks/useAuth';
import { getCustomer, updateCustomer } from '../services/customerService';
import { downloadCustomerStatement } from '../services/reportService';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDateTime } from '../utils/formatDate';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Skeleton from '../components/common/Skeleton.jsx';

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { merchant } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempPhone, setTempPhone] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getCustomer(id);
      setCustomer(data.data.customer);
      setTransactions(data.data.transactions);
      setSummary(data.data.summary);
    } catch (err) {
      toast.error('Customer ledger not found');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleStatement = async () => {
    setGenerating(true);
    try {
      await downloadCustomerStatement(id, {}, `Statement-${customer.name}.pdf`);
      toast.success('Ledger statement downloaded! 📄');
    } catch (err) {
      toast.error('Failed to generate statement');
    } finally {
      setGenerating(false);
    }
  };

  const handlePhoneSave = async (e) => {
    e.preventDefault();
    try {
      const { data } = await updateCustomer(id, { phone: tempPhone });
      setCustomer(data.data.customer);
      setIsEditingPhone(false);
      toast.success('Phone number updated successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update phone number');
    }
  };

  const triggerWhatsAppReminder = () => {
    const shopName = merchant?.businessName || merchant?.name || 'our shop';
    const message = `Hello ${customer.name}, this is a reminder from ${shopName}. Your outstanding balance in our digital ledger is ${formatCurrency(customer.currentBalance)}. Please clear it soon. Thank you!`;
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${customer.phone || ''}?text=${encoded}`;
    window.open(url, '_blank');
    toast.success('Opening WhatsApp for reminder');
  };

  if (loading || !customer) {
    return (
      <Layout title="Customer Details">
        <div className="space-y-6">
          <Skeleton variant="rect" className="h-44" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton variant="rect" className="h-20" />
            <Skeleton variant="rect" className="h-20" />
          </div>
          <Skeleton variant="rect" className="h-60" />
        </div>
      </Layout>
    );
  }

  const isOutstanding = customer.currentBalance > 0;

  return (
    <Layout title={customer.name}>
      <div className="space-y-6">
        
        {/* Back Link */}
        <div className="animate-slide-up">
          <button 
            onClick={() => navigate('/customers')} 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft size={14} className="stroke-[3]" />
            <span>Back to Customers</span>
          </button>
        </div>

        {/* Top Profile Dossier Card */}
        <Card animate={true} hoverable={false} className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            
            {/* Identity details */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-lg text-blue-700">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{customer.name}</h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1 text-xs text-slate-405 font-semibold items-center">
                  {isEditingPhone ? (
                    <form onSubmit={handlePhoneSave} className="flex items-center gap-1.5 animate-slide-up bg-slate-50/50 p-1 rounded-xl border border-slate-200">
                      <input
                        type="text"
                        value={tempPhone}
                        onChange={(e) => setTempPhone(e.target.value)}
                        placeholder="10-digit phone..."
                        className="text-xs px-2 py-0.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-400 w-32 font-bold text-slate-700 bg-white"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="bg-blue-650 hover:bg-blue-750 text-white rounded-lg p-1 transition-all active:scale-90"
                        title="Save"
                      >
                        <Check size={10} className="stroke-[3]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingPhone(false)}
                        className="bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 rounded-lg p-1 transition-all active:scale-90"
                        title="Cancel"
                      >
                        <X size={10} className="stroke-[3]" />
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="flex items-center gap-1">
                        <Phone size={12} />
                        {customer.phone || 'No phone number'}
                      </span>
                      <button
                        onClick={() => {
                          setTempPhone(customer.phone || '');
                          setIsEditingPhone(true);
                        }}
                        className="text-[9px] text-blue-600 hover:text-blue-800 font-extrabold uppercase ml-1.5 bg-blue-50/50 hover:bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-lg tracking-wider active:scale-95 transition-all"
                      >
                        {customer.phone ? 'Edit' : 'Add'}
                      </button>
                    </div>
                  )}
                  {customer.address && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {customer.address}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Balances detail */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl w-full sm:w-auto text-right flex sm:flex-col justify-between items-center sm:items-end gap-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Outstanding Balance</span>
              <span className={`text-2xl font-extrabold ${isOutstanding ? 'text-rose-600' : 'text-sky-600'} tracking-tight`}>
                {formatCurrency(customer.currentBalance)}
              </span>
            </div>

          </div>

          {/* Quick Actions Buttons */}
          <div className="flex flex-wrap gap-2.5 pt-4 border-t border-slate-100/60">
            <Link 
              to="/voice" 
              state={{ customerId: customer._id, customerName: customer.name }}
            >
              <Button size="sm" icon={Mic} className="shadow-md shadow-blue-500/10">
                Add Transaction
              </Button>
            </Link>
            
            <Button 
              variant="secondary"
              size="sm"
              onClick={handleStatement} 
              disabled={generating} 
              icon={FileText}
            >
              {generating ? 'Generating statement...' : 'Generate Statement'}
            </Button>

            <Button 
              variant="secondary"
              size="sm"
              onClick={triggerWhatsAppReminder}
              icon={MessageCircle}
              className="!text-sky-650 hover:bg-sky-50/30"
            >
              WhatsApp Reminder
            </Button>
          </div>
        </Card>

        {/* Credit Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card hoverable={true} delayIdx={1} className="border-l-4 border-l-rose-500 bg-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Credit Given</p>
                <p className="text-lg font-extrabold text-rose-600 mt-1">{formatCurrency(summary?.totalCredit || 0)}</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 border border-rose-100/50 flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
            </div>
          </Card>

          <Card hoverable={true} delayIdx={1} className="border-l-4 border-l-sky-500 bg-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Paid Back</p>
                <p className="text-lg font-extrabold text-sky-600 mt-1">{formatCurrency(summary?.totalPayment || 0)}</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-500 border border-sky-100/50 flex items-center justify-center">
                <TrendingDown size={16} />
              </div>
            </div>
          </Card>
        </div>

        {/* Timeline Transaction History */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-800 animate-slide-up delay-2">Transaction History</h3>

          {transactions.length === 0 ? (
            <Card hoverable={false} animate={true} delayIdx={2} className="text-center py-12 bg-white">
              <Clock size={32} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400 font-medium">No ledger transactions found yet.</p>
              <p className="text-xs text-slate-400/80 mt-0.5">Use speech recognition to log first item!</p>
            </Card>
          ) : (
            /* Custom Timeline cards structure */
            <div className="relative border-l-2 border-slate-100 ml-4 pl-6 space-y-6 py-2">
              {transactions.map((tx, idx) => {
                const isCredit = tx.type === 'CREDIT';
                return (
                  <div key={tx._id} style={{ animationDelay: `${idx * 40}ms` }} className="relative group animate-slide-up">
                    
                    {/* Timeline bullet tag indicator */}
                    <span className={`absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ring-4 ring-white ${
                      isCredit ? 'bg-rose-500 shadow-sm shadow-rose-500/20' : 'bg-sky-500 shadow-sm shadow-sky-500/20'
                    }`}></span>

                    {/* Timeline details card */}
                    <Card hoverable={true} className="!p-5">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          {/* Transaction note / transcript */}
                          <p className="text-sm font-bold text-slate-800 leading-snug">
                            {tx.description || tx.transcript || (isCredit ? 'Credit Given' : 'Payment Received')}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            <span>{formatDateTime(tx.createdAt)}</span>
                            <span>•</span>
                            <span>ID: {tx.receiptNumber}</span>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="text-right shrink-0">
                          <p className={`font-extrabold text-base ${isCredit ? 'text-rose-600' : 'text-sky-600'}`}>
                            {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                          </p>
                        </div>
                      </div>

                      {/* Timeline Ledger state reference */}
                      <div className="mt-3.5 pt-3.5 border-t border-slate-100/60 flex items-center justify-between text-xs font-semibold text-slate-500 bg-slate-50/50 p-2.5 rounded-xl border border-slate-50">
                        <span>Ledger Balance:</span>
                        <strong className="text-slate-800">{formatCurrency(tx.balanceAfter)}</strong>
                      </div>
                    </Card>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}
