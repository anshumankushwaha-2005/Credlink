import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Wallet, TrendingUp, TrendingDown, Mic, Plus, FileText, ArrowRight, UserPlus, ChevronRight, Square, Loader2 } from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import { listCustomers } from '../services/customerService';
import { listTransactions, searchCustomerVoice } from '../services/transactionService';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDateTime } from '../utils/formatDate';
import { useAuth } from '../hooks/useAuth';
import { useVoice } from '../hooks/useVoice';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import Modal from '../components/common/Modal.jsx';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { merchant } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    outstandingCredit: 0,
    todayCredit: 0,
    todayPayment: 0,
    todayCount: 0,
  });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);
  const [searchTranscribing, setSearchTranscribing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const {
    isListening: searchListening,
    error: searchError,
    duration: searchDuration,
    audioBlob: searchAudioBlob,
    startListening: startSearchListening,
    stopListening: stopSearchListening,
    resetTranscript: resetSearchTranscript,
  } = useVoice();

  // Dynamic time-based greeting
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good morning';
    if (hrs < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    (async () => {
      try {
        const [customersRes, txRes] = await Promise.all([
          listCustomers({ limit: 100 }),
          listTransactions({ limit: 5 }),
        ]);

        const customers = customersRes.data.data.customers;
        const outstandingCredit = customers.reduce((s, c) => s + c.currentBalance, 0);

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const todayTxRes = await listTransactions({ limit: 200 });
        const todayTx = todayTxRes.data.data.transactions.filter((t) => new Date(t.createdAt) >= startOfDay);
        const todayCredit = todayTx.filter((t) => t.type === 'CREDIT').reduce((s, t) => s + t.amount, 0);
        const todayPayment = todayTx.filter((t) => t.type === 'PAYMENT').reduce((s, t) => s + t.amount, 0);

        setStats({
          totalCustomers: customersRes.data.data.total,
          outstandingCredit,
          todayCredit,
          todayPayment,
          todayCount: todayTx.length,
        });
        setRecent(txRes.data.data.transactions);
      } catch (err) {
        // quiet error
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Trigger voice customer search upload when audio recording completes
  useEffect(() => {
    if (searchAudioBlob) {
      handleVoiceSearchUpload(searchAudioBlob);
    }
  }, [searchAudioBlob]);

  const handleVoiceSearchUpload = async (blob) => {
    setSearchTranscribing(true);
    setSuggestions([]);
    try {
      const mime = blob.type || 'audio/webm';
      const parts = mime.split(';')[0].split('/');
      let ext = parts[1] || 'webm';
      if (ext === 'mpeg' || ext === 'mpga') ext = 'mp3';

      const formData = new FormData();
      formData.append('audio', blob, `search.${ext}`);
      
      const { data } = await searchCustomerVoice(formData);
      const customer = data.data.customer;
      const transcript = data.data.transcript;
      const suggs = data.data.suggestions || [];
      
      if (customer) {
        toast.success(`Found Customer: ${customer.name}! Opening profile... 🚀`);
        setShowVoiceSearch(false);
        navigate(`/customers/${customer._id}`);
      } else if (suggs.length > 0) {
        setSuggestions(suggs);
        toast.success(`Select from suggested matching names below!`);
      } else {
        toast.error(`No customer found matching "${transcript}". Please try again.`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Voice search failed. Please speak clearly.');
    } finally {
      setSearchTranscribing(false);
      resetSearchTranscript();
    }
  };

  const handleVoiceSearchToggle = () => {
    if (searchListening) {
      stopSearchListening();
    } else {
      resetSearchTranscript();
      startSearchListening();
    }
  };

  const closeVoiceSearch = () => {
    stopSearchListening();
    setShowVoiceSearch(false);
    resetSearchTranscript();
    setSuggestions([]);
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        
        {/* Dynamic Welcomer Header with Voice Search Quick Action */}
        <div className="flex justify-between items-center animate-slide-up">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
              {getGreeting()}, {merchant?.name || 'Merchant'} 👋
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5 font-medium">Here's how your shop is doing today.</p>
          </div>
          <button
            onClick={() => setShowVoiceSearch(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-2xl border border-blue-100/50 text-xs font-bold active:scale-95 transition-all shadow-sm shadow-blue-500/5"
          >
            <Mic size={14} className="animate-pulse" />
            <span>Voice Search</span>
          </button>
        </div>

        {/* Stats Cards Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          
          {/* Stats Card 1: Outstanding Credit */}
          <Card hoverable={true} delayIdx={1} className="!p-3.5 sm:!p-5 border-l-4 border-l-rose-500 relative overflow-hidden group">
            <div className="flex justify-between items-start gap-1">
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Outstanding</p>
                {loading ? (
                  <Skeleton variant="text" className="w-16 h-6 mt-1.5" />
                ) : (
                  <p className="text-base sm:text-2xl font-extrabold text-rose-600 mt-1 truncate tracking-tight">
                    {formatCurrency(stats.outstandingCredit)}
                  </p>
                )}
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100/50 shrink-0">
                <Wallet size={16} className="sm:w-5 sm:h-5" />
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-rose-600/80 font-semibold mt-2.5 truncate">
              <span>Active credit in ledger</span>
            </p>
          </Card>

          {/* Stats Card 2: Total Customers */}
          <Card hoverable={true} delayIdx={1} className="!p-3.5 sm:!p-5 border-l-4 border-l-blue-500 relative overflow-hidden group">
            <div className="flex justify-between items-start gap-1">
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Customers</p>
                {loading ? (
                  <Skeleton variant="text" className="w-12 h-6 mt-1.5" />
                ) : (
                  <p className="text-base sm:text-2xl font-extrabold text-blue-600 mt-1 truncate tracking-tight">
                    {stats.totalCustomers}
                  </p>
                )}
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100/50 shrink-0">
                <Users size={16} className="sm:w-5 sm:h-5" />
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-blue-650 font-semibold mt-2.5 truncate">
              <span>Total registered shop accounts</span>
            </p>
          </Card>

          {/* Stats Card 3: Today's Credit */}
          <Card hoverable={true} delayIdx={2} className="!p-3.5 sm:!p-5 border-l-4 border-l-amber-500 relative overflow-hidden group">
            <div className="flex justify-between items-start gap-1">
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Today's Credit</p>
                {loading ? (
                  <Skeleton variant="text" className="w-16 h-6 mt-1.5" />
                ) : (
                  <p className="text-base sm:text-2xl font-extrabold text-amber-600 mt-1 truncate tracking-tight">
                    {formatCurrency(stats.todayCredit)}
                  </p>
                )}
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100/50 shrink-0">
                <TrendingUp size={16} className="sm:w-5 sm:h-5" />
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-2.5 truncate">
              Recorded in ledger
            </p>
          </Card>

          {/* Stats Card 4: Today's Payments */}
          <Card hoverable={true} delayIdx={2} className="!p-3.5 sm:!p-5 border-l-4 border-l-sky-500 relative overflow-hidden group">
            <div className="flex justify-between items-start gap-1">
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Today's Payments</p>
                {loading ? (
                  <Skeleton variant="text" className="w-16 h-6 mt-1.5" />
                ) : (
                  <p className="text-base sm:text-2xl font-extrabold text-sky-600 mt-1 truncate tracking-tight">
                    {formatCurrency(stats.todayPayment)}
                  </p>
                )}
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500 border border-sky-100/50 shrink-0">
                <TrendingDown size={16} className="sm:w-5 sm:h-5" />
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-sky-655 font-semibold mt-2.5 truncate">
              Received in cash/UPI
            </p>
          </Card>
        </div>

        {/* Floating Voice Action Card */}
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-md shadow-blue-500/10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden animate-slide-up delay-2">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl"></div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
              <span>Primary Action</span>
            </div>
            <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">Add Transaction using Voice</h3>
            <p className="text-blue-50/90 text-xs md:text-sm max-w-md leading-relaxed">
              Just speak naturally. For example, say:<br />
              <strong className="text-white font-bold bg-white/10 px-2 py-0.5 rounded italic">"Ramesh ko 500 rupaye udhaar diya"</strong>
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 shrink-0 relative z-10">
            <button 
              onClick={() => navigate('/voice')}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white hover:bg-blue-50 text-teal-600 flex items-center justify-center shadow-lg active:scale-95 transition-all duration-300 mic-pulse animate-bounce"
            >
              <Mic size={28} className="text-blue-600 md:w-8 md:h-8" />
            </button>
            <span className="text-[10px] sm:text-xs font-bold text-blue-55 tracking-wide uppercase">Tap to Speak</span>
          </div>
        </div>

        {/* Quick Links & Recent Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Quick Actions Shortcuts */}
          <div className="lg:col-span-4 space-y-4 animate-slide-up delay-3">
            <h3 className="text-base font-bold text-slate-800">Quick Actions</h3>
            
            <Link to="/customers" className="card p-4 flex items-center gap-3.5 hover:-translate-y-0.5 transition-all bg-white">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <UserPlus size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 leading-none">Add Customer</p>
                <p className="text-xs text-slate-400 mt-1.5">Register a new shop customer</p>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </Link>

            <button
              onClick={() => setShowVoiceSearch(true)}
              className="w-full text-left card p-4 flex items-center gap-3.5 hover:-translate-y-0.5 transition-all bg-white"
            >
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Mic size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 leading-none">Voice Search Customer</p>
                <p className="text-xs text-slate-400 mt-1.5">Say customer name to open profile</p>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </button>

            <Link to="/reports" className="card p-4 flex items-center gap-3.5 hover:-translate-y-0.5 transition-all bg-white">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 leading-none">Customer Statements</p>
                <p className="text-xs text-slate-400 mt-1.5">Generate and share PDF statements</p>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </Link>
          </div>

          {/* Recent Ledger List */}
          <div className="lg:col-span-8 space-y-4 animate-slide-up delay-3">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800">Recent Transactions</h3>
              <Link to="/transactions" className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5">
                <span>View All History</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <Card hoverable={false} className="!p-0 bg-white">
              {loading ? (
                <div className="py-8 px-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton variant="avatar" />
                    <div className="flex-1 space-y-2">
                      <Skeleton variant="text" className="w-24 h-4" />
                      <Skeleton variant="text" className="w-36 h-3" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton variant="avatar" />
                    <div className="flex-1 space-y-2">
                      <Skeleton variant="text" className="w-20 h-4" />
                      <Skeleton variant="text" className="w-32 h-3" />
                    </div>
                  </div>
                </div>
              ) : recent.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">
                  <p>No transactions recorded yet.</p>
                  <p className="text-xs text-slate-400/80 mt-1">Tap the microphone card above to start voice entry!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100/60 px-5">
                  {recent.map((tx) => (
                    <div key={tx._id} className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100 font-bold text-xs shrink-0">
                          {tx.customerId?.name ? tx.customerId.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate leading-tight">{tx.customerId?.name || 'Unknown Customer'}</p>
                          <p className="text-[10px] text-slate-450 mt-1 truncate">{formatDateTime(tx.createdAt)} · Receipt #{tx.receiptNumber}</p>
                        </div>
                      </div>
                      <span className={`font-extrabold text-sm shrink-0 ${tx.type === 'CREDIT' ? 'text-rose-600' : 'text-sky-600'}`}>
                        {tx.type === 'CREDIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

        </div>

      </div>

      {/* VOICE SEARCH CUSTOMER MODAL */}
      <Modal
        isOpen={showVoiceSearch}
        onClose={closeVoiceSearch}
        title="Voice Search Customer"
        subtitle="Speak the customer's name to open their profile"
        icon={Mic}
      >
        <div className="flex flex-col items-center py-6 space-y-5 text-center">
          
          <button
            type="button"
            onClick={handleVoiceSearchToggle}
            disabled={searchTranscribing}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 ${
              searchListening
                ? 'bg-rose-500 text-white mic-pulse'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10'
            } ${searchTranscribing ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {searchListening ? <Square size={22} className="fill-white" /> : <Mic size={24} />}
          </button>

          {/* Soundwave animation */}
          {searchListening && (
            <div className="flex justify-center items-center h-10 space-x-1">
              <div className="soundwave-bar"></div>
              <div className="soundwave-bar"></div>
              <div className="soundwave-bar"></div>
              <div className="soundwave-bar flex-1"></div>
              <div className="soundwave-bar"></div>
              <div className="soundwave-bar"></div>
            </div>
          )}

          {/* Status text */}
          <p className="text-xs font-semibold text-slate-400 max-w-xs leading-relaxed">
            {searchListening ? (
              <span className="text-rose-500 animate-pulse font-bold uppercase tracking-wider block">
                Listening ({formatTimer(searchDuration)})...
              </span>
            ) : searchTranscribing ? (
              <span className="text-blue-500 animate-pulse font-bold uppercase tracking-wider block flex items-center gap-1.5 justify-center">
                <Loader2 size={12} className="animate-spin" />
                Searching ledger via Groq Whisper...
              </span>
            ) : (
              <span>Tap the mic and speak a customer's name<br />(e.g., "Ramesh Kumar" or "Suresh")</span>
            )}
          </p>

          {/* Error display */}
          {searchError && (
            <div className="text-center p-3 bg-rose-50 rounded-2xl border border-rose-100 text-rose-600 text-xs font-medium max-w-xs animate-shake">
              ⚠️ {searchError}
            </div>
          )}

          {/* Suggestions List */}
          {suggestions.length > 0 && (
            <div className="w-full max-w-xs space-y-2 pt-2 animate-fade-in">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                Suggested Matches
              </p>
              <div className="flex flex-col gap-1.5 border border-slate-100 rounded-2xl p-2 bg-slate-50/40 max-h-40 overflow-y-auto">
                {suggestions.map((s) => (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => {
                      setShowVoiceSearch(false);
                      setSuggestions([]);
                      navigate(`/customers/${s._id}`);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 rounded-xl text-xs font-bold text-slate-700 flex justify-between items-center transition-all duration-200 active:scale-[0.98]"
                  >
                    <span>👤 {s.name}</span>
                    <span className="text-[10px] font-medium text-slate-450">{formatCurrency(s.currentBalance)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </Modal>

    </Layout>
  );
}
