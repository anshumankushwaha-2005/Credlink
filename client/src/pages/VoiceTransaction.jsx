import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mic, Square, Search, CheckCircle2, Download, MessageCircle, Eye, X, ArrowLeft, ArrowRight, Check, Phone, Receipt, Loader2 } from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import { useVoice } from '../hooks/useVoice';
import { useAuth } from '../hooks/useAuth';
import { listCustomers, createCustomer } from '../services/customerService';
import { extractVoice, createTransaction, transcribeVoice } from '../services/transactionService';
import { downloadBill, sendBillWhatsApp } from '../services/billService';
import { formatCurrency } from '../utils/formatCurrency';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Badge from '../components/common/Badge.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import Modal from '../components/common/Modal.jsx';

const speakMessage = (text) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const hindiVoice = voices.find(
    (v) => v.lang.toLowerCase() === 'hi-in' || v.lang.toLowerCase().startsWith('hi')
  );
  if (hindiVoice) {
    utterance.voice = hindiVoice;
  }
  window.speechSynthesis.speak(utterance);
};

export default function VoiceTransaction() {
  const location = useLocation();
  const navigate = useNavigate();
  const preselected = location.state;
  const { merchant } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Wizard Step: 1 (Speak), 2 (Review), 3 (Confirm), 4 (Done)
  const [step, setStep] = useState(1);
  
  const [extraction, setExtraction] = useState(null);
  const [needsReview, setNeedsReview] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [voiceLang, setVoiceLang] = useState('hi'); // Default: Hindi
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  
  // Modals state
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsappResult, setWhatsappResult] = useState(null);
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);

  const {
    isSupported,
    isListening,
    transcript,
    error: micError,
    duration,
    audioBlob,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript
  } = useVoice();

  useEffect(() => {
    listCustomers({ limit: 100 }).then(({ data }) => {
      setCustomers(data.data.customers);
      if (preselected?.customerId) {
        const found = data.data.customers.find((c) => c._id === preselected.customerId);
        if (found) setSelectedCustomer(found);
      }
    });
  }, [preselected]);

  // Trigger transcription upload when audioBlob is recorded
  useEffect(() => {
    if (audioBlob) {
      handleAudioUpload(audioBlob);
    }
  }, [audioBlob]);

  const handleAudioUpload = async (blob) => {
    setTranscribing(true);
    try {
      const mime = blob.type || 'audio/webm';
      const parts = mime.split(';')[0].split('/');
      let ext = parts[1] || 'webm';
      if (ext === 'mpeg' || ext === 'mpga') ext = 'mp3';

      const formData = new FormData();
      formData.append('audio', blob, `recording.${ext}`);
      formData.append('language', voiceLang);
      
      const { data } = await transcribeVoice(formData);
      const text = data.data.text;
      
      setTranscript(text);
      await runExtraction(text);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transcription failed. Please speak again.');
      resetTranscript();
    } finally {
      setTranscribing(false);
    }
  };

  const runExtraction = async (text) => {
    setExtracting(true);
    try {
      const { data } = await extractVoice(text, selectedCustomer?._id);
      const ext = data.data.extraction;
      setExtraction(ext);
      setNeedsReview(data.data.needsReview);

      const suggestionsList = data.data.suggestions || [];
      setSuggestions(suggestionsList);

      // Auto-select customer if found/matched by the backend NLP
      if (data.data.customer) {
        setSelectedCustomer(data.data.customer);
        setSuggestions([]);
      } else if (ext.customerName) {
        setSearch(ext.customerName); // prefill search input
      }

      // Trigger toasts/warnings for missing fields
      const hasName = !!selectedCustomer || !!data.data.customer || !!ext.customerName;
      const hasAmount = !!ext.amount;

      if (!hasName && !hasAmount) {
        toast.error('Please say something like: Ramesh ko 500 rupaye ka udhaar diya.', { duration: 5000 });
      } else if (!hasName) {
        toast.error('Please say the customer name.', { duration: 4000 });
      } else if (!hasAmount) {
        toast.error('Please say the amount.', { duration: 4000 });
      }

      setStep(2); // Automatically advance to Step 2 once extracted
    } catch (err) {
      toast.error("Couldn't understand the voice. Please try again.");
    } finally {
      setExtracting(false);
    }
  };

  const handleQuickCreate = async (name) => {
    try {
      const { data } = await createCustomer({ name });
      const newCust = data.data.customer;
      setSelectedCustomer(newCust);
      setSuggestions([]);
      toast.success(`Customer "${newCust.name}" created & linked! 🎉`);
      speakMessage(`${newCust.name} naam ka customer successfully add kar diya gaya hai.`);
      // Refresh local customers list
      listCustomers({ limit: 100 }).then(({ data }) => {
        setCustomers(data.data.customers);
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create customer');
      speakMessage('Transaction save nahi ho paya. Please dobara try karein.');
    }
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      setExtraction(null);
      setResult(null);
      resetTranscript();
      startListening();
    }
  };

  const handleConfirm = async () => {
    if (!selectedCustomer || !extraction?.amount || !extraction?.type) {
      toast.error('Amount and transaction type are required');
      return;
    }
    setConfirming(true);
    try {
      const { data } = await createTransaction({
        customerId: selectedCustomer._id,
        amount: extraction.amount,
        type: extraction.type,
        description: extraction.rawText,
        transcript: extraction.rawText,
        source: 'voice',
      });
      setResult(data.data);
      setStep(4); // Move to Done state
      toast.success('Transaction saved and bill generated! 🎉');
      
      if (extraction.type === 'CREDIT') {
        speakMessage(`${selectedCustomer.name} ke account mein ${extraction.amount} rupaye add kiye gaye hain.`);
      } else if (extraction.type === 'PAYMENT') {
        speakMessage(`${selectedCustomer.name} se ${extraction.amount} rupaye receive kiye gaye hain.`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save transaction');
      speakMessage('Transaction save nahi ho paya. Please dobara try karein.');
    } finally {
      setConfirming(false);
    }
  };

  const handleDownload = async () => {
    if (!result) return;
    try {
      await downloadBill(result.transaction._id, `${result.transaction.receiptNumber}.pdf`);
      toast.success('PDF download initiated');
    } catch (err) {
      toast.error('Failed to download PDF');
    }
  };

  const handleWhatsAppSend = async () => {
    setSendingWhatsapp(true);
    try {
      const { data } = await sendBillWhatsApp(result.transaction._id);
      setWhatsappResult(data.data);
      setShowWhatsAppModal(false); // Close confirmation modal
      if (data.data.mode === 'twilio') {
        toast.success('Receipt shared via WhatsApp');
      } else if (data.data.whatsappWebUrl) {
        window.open(data.data.whatsappWebUrl, '_blank');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send WhatsApp message');
    } finally {
      setSendingWhatsapp(false);
    }
  };

  const resetAll = () => {
    setStep(1);
    setResult(null);
    setExtraction(null);
    setWhatsappResult(null);
    setSuggestions([]);
    setSearch('');
    resetTranscript();
  };

  const filteredCustomers = customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  // Calculate dynamic preview balances
  const getPreviewBalances = () => {
    if (!selectedCustomer || !extraction) return { prev: 0, next: 0 };
    const prev = selectedCustomer.currentBalance;
    const change = Number(extraction.amount) || 0;
    const next = extraction.type === 'CREDIT' ? prev + change : prev - change;
    return { prev, next };
  };

  const { prev: previewPrev, next: previewNext } = getPreviewBalances();

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <Layout title="Voice Entry">
      <div className="max-w-2xl mx-auto space-y-6 pb-12">
        
        {/* Wizard Step Indicator */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100/60 shadow-soft flex justify-between items-center text-xs font-semibold text-slate-400 animate-slide-up">
          <div className={`flex items-center gap-1.5 ${step === 1 ? 'text-blue-600 font-bold' : step > 1 ? 'text-slate-700' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' : step > 1 ? 'bg-slate-100 text-slate-700' : 'bg-slate-50'}`}>1</span>
            <span>Speak</span>
          </div>
          <div className="flex-1 border-t border-slate-100 mx-3"></div>
          <div className={`flex items-center gap-1.5 ${step === 2 ? 'text-blue-600 font-bold' : step > 2 ? 'text-slate-700' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' : step > 2 ? 'bg-slate-100 text-slate-700' : 'bg-slate-50'}`}>2</span>
            <span>Review</span>
          </div>
          <div className="flex-1 border-t border-slate-100 mx-3"></div>
          <div className={`flex items-center gap-1.5 ${step === 3 ? 'text-blue-600 font-bold' : step > 3 ? 'text-slate-700' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' : step > 3 ? 'bg-slate-100 text-slate-700' : 'bg-slate-50'}`}>3</span>
            <span>Confirm</span>
          </div>
          <div className="flex-1 border-t border-slate-100 mx-3"></div>
          <div className={`flex items-center gap-1.5 ${step === 4 ? 'text-blue-600 font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 4 ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' : 'bg-slate-50'}`}>4</span>
            <span>Done</span>
          </div>
        </div>

        {/* STEP 1: SPEAK & RECORD */}
        {step === 1 && (
          <div className="space-y-6">
            
            {/* Customer Selector Card */}
            <Card hoverable={false} animate={true} delayIdx={1}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">1. Select Customer</h3>
                {selectedCustomer && (
                  <Badge variant="primary">Active Customer</Badge>
                )}
              </div>
              
              {selectedCustomer ? (
                <div className="flex items-center justify-between bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                      {selectedCustomer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{selectedCustomer.name}</p>
                      <p className="text-xs text-slate-450 mt-0.5">{selectedCustomer.phone || 'No phone'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedCustomer(null);
                      setExtraction(null);
                    }} 
                    className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-xl transition-colors active:scale-90"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search shop customers..."
                    icon={Search}
                  />
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-50 border border-slate-100 rounded-2xl bg-slate-50/20">
                    {filteredCustomers.length === 0 ? (
                      <p className="text-sm text-slate-450 text-center py-6">No customers found. Try adding a new customer.</p>
                    ) : (
                      filteredCustomers.map((c) => (
                        <button
                          key={c._id}
                          onClick={() => setSelectedCustomer(c)}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 flex justify-between items-center text-sm transition-colors"
                        >
                          <span className="font-bold text-slate-700">{c.name}</span>
                          <span className="text-xs text-slate-450 font-medium">Balance: {formatCurrency(c.currentBalance)}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* Voice Input Section */}
            <Card hoverable={false} animate={true} delayIdx={2} className="flex flex-col items-center py-10 space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">2. Speak naturally</h3>
                <p className="text-xs text-slate-400">Add credit or payments using Groq Whisper Speech AI</p>
              </div>

              {!isSupported ? (
                <div className="text-center p-4 bg-rose-50 rounded-2xl border border-rose-100 text-rose-600 text-xs font-medium max-w-sm">
                  🎙️ Audio recording isn't supported in this browser. Please use a modern browser with microphone access.
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-5 w-full animate-fade-in">
                  
                  {/* Language Selection Pills */}
                  <div className="space-y-1.5 w-full max-w-xs mx-auto animate-slide-up">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                      Choose Speech Language (बोली जाने वाली भाषा)
                    </label>
                    <div className="flex gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-100/60">
                      <button
                        type="button"
                        onClick={() => setVoiceLang('hi')}
                        className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-200 active:scale-95 ${
                          voiceLang === 'hi'
                            ? 'bg-white text-blue-600 shadow-sm border border-slate-100'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        Hindi/Hinglish
                      </button>
                      <button
                        type="button"
                        onClick={() => setVoiceLang('en')}
                        className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-200 active:scale-95 ${
                          voiceLang === 'en'
                            ? 'bg-white text-blue-600 shadow-sm border border-slate-100'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        English
                      </button>
                      <button
                        type="button"
                        onClick={() => setVoiceLang('auto')}
                        className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-200 active:scale-95 ${
                          voiceLang === 'auto'
                            ? 'bg-white text-blue-600 shadow-sm border border-slate-100'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        Auto-Detect
                      </button>
                    </div>
                  </div>
                  
                  {/* Micro button wrapper */}
                  <div className="flex items-center justify-center">
                    <button
                      onClick={handleMicToggle}
                      disabled={transcribing}
                      className={`mic-btn ${
                        isListening 
                          ? 'bg-rose-500 text-white mic-pulse' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10'
                      } ${transcribing ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      {isListening ? <Square size={28} className="fill-white" /> : <Mic size={32} />}
                    </button>
                  </div>

                  {/* Audio Bouncing Waveform Animation when listening */}
                  {isListening && (
                    <div className="flex justify-center items-center h-12">
                      <div className="soundwave-bar"></div>
                      <div className="soundwave-bar"></div>
                      <div className="soundwave-bar"></div>
                      <div className="soundwave-bar"></div>
                      <div className="soundwave-bar flex-1"></div>
                      <div className="soundwave-bar"></div>
                      <div className="soundwave-bar"></div>
                      <div className="soundwave-bar"></div>
                    </div>
                  )}

                  {/* Error messages */}
                  {micError && (
                    <div className="text-center p-3 bg-rose-50 rounded-2xl border border-rose-100 text-rose-600 text-xs font-medium max-w-sm animate-shake">
                      ⚠️ {micError}
                    </div>
                  )}

                  {/* Speech status description */}
                  <p className="text-xs font-semibold text-slate-400 text-center max-w-xs leading-relaxed">
                    {isListening ? (
                      <span className="text-rose-500 animate-pulse font-bold uppercase tracking-wider block">
                        Recording ({formatTimer(duration)})...
                      </span>
                    ) : transcribing ? (
                      <span className="text-blue-500 animate-pulse font-bold uppercase tracking-wider block flex items-center gap-1.5 justify-center">
                        <Loader2 size={12} className="animate-spin" />
                        Transcribing audio via Groq Whisper...
                      </span>
                    ) : (
                      <span>Tap microphone above & say:<br />"Ramesh ko 500 rupaye udhaar diya"</span>
                    )}
                  </p>

                  {/* Realtime transcript preview block */}
                  {transcript && (
                    <div className="w-full max-w-md bg-slate-50/80 rounded-2xl p-4 border border-slate-100 text-center animate-fade-in">
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1.5">You said</p>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed">
                        {transcript}
                      </p>
                    </div>
                  )}

                  {/* Processing loader */}
                  {extracting && (
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Understanding transaction details...</span>
                    </div>
                  )}

                </div>
              )}
            </Card>

          </div>
        )}

        {/* STEP 2: REVIEW EXTRACTED DETAILS */}
        {step === 2 && extraction && (
          <Card hoverable={false} animate={true} className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800">Review Transaction Details</h3>
              <Badge variant="warning">Step 2 of 4</Badge>
            </div>

            {needsReview && (
              <div className="bg-amber-50/70 border border-amber-200/50 rounded-2xl p-4 text-xs text-amber-800 leading-relaxed">
                ⚠️ <strong>Low Confidence:</strong> CredLink couldn't extract all details with certainty. Please double-check amounts and transaction types.
              </div>
            )}

            <div className="space-y-4">
              
              {/* Customer display */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Customer</label>
                {selectedCustomer ? (
                  <div className="flex items-center justify-between bg-blue-50/50 rounded-2xl p-3.5 border border-blue-100/50 font-bold text-slate-700 text-sm">
                    <span>👤 {selectedCustomer.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(null)}
                      className="text-xs text-rose-500 hover:text-rose-600 font-bold hover:underline"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Suggestions list when multiple matches found */}
                    {suggestions.length > 0 && (
                      <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-4 space-y-2.5 animate-slide-up">
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                          Multiple matches found. Select one:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {suggestions.map((c) => (
                            <button
                              key={c._id}
                              type="button"
                              onClick={() => {
                                setSelectedCustomer(c);
                                setSuggestions([]);
                              }}
                              className="bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl transition-all shadow-sm active:scale-95"
                            >
                              👤 {c.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Create option when no matching customer exists but we extracted a name */}
                    {suggestions.length === 0 && extraction?.customerName && (
                      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between animate-slide-up">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            New Customer?
                          </p>
                          <p className="text-xs font-bold text-slate-800 mt-0.5">
                            Create "{extraction.customerName}" in your ledger
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleQuickCreate(extraction.customerName)}
                          className="btn-primary !py-1.5 !px-3 text-xs !rounded-xl active:scale-95 font-bold whitespace-nowrap shadow-sm shadow-blue-500/10"
                        >
                          + Add & Link
                        </button>
                      </div>
                    )}

                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search customer to link..."
                      icon={Search}
                    />
                    <div className="max-h-36 overflow-y-auto divide-y divide-slate-50 border border-slate-100 rounded-2xl bg-white">
                      {filteredCustomers.length === 0 ? (
                        <p className="text-[11px] text-slate-400 text-center py-4">No customers match search</p>
                      ) : (
                        filteredCustomers.map((c) => (
                          <button
                            key={c._id}
                            type="button"
                            onClick={() => setSelectedCustomer(c)}
                            className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex justify-between items-center text-xs transition-colors"
                          >
                            <span className="font-bold text-slate-700">{c.name}</span>
                            <span className="text-[10px] text-slate-450 font-medium">Balance: {formatCurrency(c.currentBalance)}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Amount input */}
              <Input
                label="Amount (₹)"
                type="number"
                value={extraction.amount ?? ''}
                onChange={(e) => setExtraction({ ...extraction, amount: parseFloat(e.target.value) || 0 })}
                placeholder="Enter amount"
                required
              />

              {/* Transaction Type toggles */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Transaction Type</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setExtraction({ ...extraction, type: 'CREDIT' })}
                    className={`flex-1 py-3 rounded-2xl text-sm font-bold border transition-all duration-200 active:scale-[0.98] ${
                      extraction.type === 'CREDIT'
                        ? 'bg-rose-50 border-rose-300 text-rose-600 shadow-sm shadow-rose-500/5'
                        : 'border-slate-200 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Credit (Udhaar diya)
                  </button>
                  <button
                    onClick={() => setExtraction({ ...extraction, type: 'PAYMENT' })}
                    className={`flex-1 py-3 rounded-2xl text-sm font-bold border transition-all duration-200 active:scale-[0.98] ${
                      extraction.type === 'PAYMENT'
                        ? 'bg-sky-50 border-sky-300 text-sky-600 shadow-sm shadow-sky-500/5'
                        : 'border-slate-200 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Payment (Mila / Jama)
                  </button>
                </div>
              </div>

              {/* Transcript Display */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Live Transcript (Edit if needed)</label>
                <textarea
                  value={extraction.rawText || ''}
                  onChange={(e) => setExtraction({ ...extraction, rawText: e.target.value })}
                  rows={2}
                  className="w-full rounded-2xl border border-slate-200/80 px-4 py-3 text-sm text-slate-700 bg-slate-50/50 focus:outline-none focus:border-slate-350 transition-all focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

            </div>

            {/* Step 2 Actions */}
            <div className="flex gap-3 pt-2">
              <Button 
                variant="secondary"
                onClick={() => setStep(1)} 
                icon={ArrowLeft}
                className="flex-1 py-3.5"
              >
                Back
              </Button>
               <Button 
                onClick={() => {
                  if (!selectedCustomer) {
                    toast.error('Please select a customer to link this transaction');
                    return;
                  }
                  if (!extraction.amount || extraction.amount <= 0) {
                    toast.error('Please enter a valid amount');
                    return;
                  }
                  setStep(3);
                }} 
                className="flex-1 py-3.5"
              >
                <span>Review Balances</span>
                <ArrowRight size={16} />
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 3: TRANSACTION PREVIEW & CONFIRM BALANCES */}
        {step === 3 && extraction && (
          <Card hoverable={false} animate={true} className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Confirm Balance Change</h3>
              <Badge variant="primary">Step 3 of 4</Badge>
            </div>

            <div className="text-center py-2">
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Is this correct?</p>
            </div>

            {/* Ledger balance sheet simulation layout */}
            <div className="border border-slate-100 rounded-3xl overflow-hidden bg-slate-50/40">
              
              {/* Summary block */}
              <div className="p-5 bg-white border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Customer</p>
                  <p className="font-bold text-slate-800 text-base mt-0.5">{selectedCustomer?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Transaction Type</p>
                  <span className={`inline-block font-extrabold text-sm px-2.5 py-1 rounded-full mt-1 ${
                    extraction.type === 'CREDIT' ? 'bg-rose-50 text-rose-600' : 'bg-sky-50 text-sky-600'
                  }`}>
                    {extraction.type}
                  </span>
                </div>
              </div>

              {/* Detail transaction specs */}
              <div className="p-5 space-y-4">
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-550 font-medium">Recorded Amount:</span>
                  <span className="font-extrabold text-slate-800 text-base">{formatCurrency(extraction.amount)}</span>
                </div>

                <div className="flex justify-between items-center text-sm border-t border-slate-100/60 pt-3">
                  <span className="text-slate-550 font-medium">Previous Balance:</span>
                  <span className="font-semibold text-slate-650">{formatCurrency(previewPrev)}</span>
                </div>

                <div className="flex justify-between items-center text-sm border-t border-slate-100/60 pt-3">
                  <span className="text-slate-800 font-bold">New Ledger Balance:</span>
                  <span className={`text-lg font-extrabold ${previewNext > 0 ? 'text-rose-600' : 'text-sky-600'}`}>
                    {formatCurrency(previewNext)}
                  </span>
                </div>

                {extraction.rawText && (
                  <div className="border-t border-slate-100/60 pt-3 text-left">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Raw Note:</span>
                    <p className="text-xs text-slate-500 italic mt-1 font-medium bg-white p-2.5 rounded-xl border border-slate-100">
                      "{extraction.rawText}"
                    </p>
                  </div>
                )}

              </div>
            </div>

            {/* Confirm Actions */}
            <div className="flex gap-3 pt-2">
              <Button 
                variant="secondary"
                onClick={() => setStep(2)} 
                icon={ArrowLeft}
                className="flex-1 py-3.5"
              >
                Edit Details
              </Button>
              
              <Button 
                onClick={handleConfirm} 
                disabled={confirming} 
                loading={confirming}
                icon={Check}
                className="flex-1 py-3.5 shadow-md shadow-blue-500/10"
              >
                Confirm Transaction
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 4: SUCCESS / DONE STATE */}
        {step === 4 && result && (
          <Card hoverable={false} animate={true} className="text-center space-y-6 py-8 relative overflow-hidden">
            
            {/* Visual Success Elements */}
            <div className="w-16 h-16 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center mx-auto border border-sky-100/60 shadow-sm animate-bounce">
              <CheckCircle2 size={36} className="stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Transaction Added! 🎉</h2>
              <p className="text-sm text-slate-505 leading-relaxed max-w-sm mx-auto">
                <strong>{formatCurrency(result.transaction.amount)}</strong> {result.transaction.type.toLowerCase()} recorded for <strong>{selectedCustomer?.name}</strong>.
              </p>
            </div>

            {/* Balance Summary Display */}
            <div className="max-w-xs mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-100/60 flex flex-col items-center justify-center space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">New Ledger Balance</span>
              <span className={`text-xl font-extrabold ${result.customer.currentBalance > 0 ? 'text-rose-600' : 'text-sky-600'}`}>
                {formatCurrency(result.customer.currentBalance)}
              </span>
              <span className="text-[10px] text-slate-450 mt-1">Receipt ID: {result.transaction.receiptNumber}</span>
            </div>

            {/* Document Badges */}
            <div className="flex justify-center items-center gap-4 text-xs font-semibold text-blue-700/80 bg-blue-50/40 py-2.5 rounded-2xl border border-blue-100/20 max-w-xs mx-auto">
              <div className="flex items-center gap-1">
                <Check size={12} className="stroke-[3]" />
                <span>Bill generated</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-blue-300"></div>
              <div className="flex items-center gap-1">
                <Check size={12} className="stroke-[3]" />
                <span>Ready to share</span>
              </div>
            </div>

            {/* Done Actions */}
            <div className="flex flex-col gap-2.5 max-w-sm mx-auto pt-2">
              <Button 
                onClick={() => setShowWhatsAppModal(true)} 
                icon={MessageCircle}
                className="w-full py-4 bg-sky-650 hover:bg-sky-700 border-none shadow-md shadow-sky-500/10"
              >
                Send on WhatsApp
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowBillPreview(true)} 
                  icon={Eye}
                  className="text-xs py-3.5"
                >
                  View Bill
                </Button>
                <Button 
                  variant="secondary"
                  size="sm"
                  onClick={handleDownload} 
                  icon={Download}
                  className="text-xs py-3.5"
                >
                  Download PDF
                </Button>
              </div>
            </div>

            {/* Link to record another */}
            <div className="pt-4 border-t border-slate-100/60 max-w-xs mx-auto">
              <button onClick={resetAll} className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline">
                Record another transaction
              </button>
            </div>
            
          </Card>
        )}

      </div>

      {/* MODAL 1: BILL PREVIEW RECEIPT */}
      <Modal
        isOpen={showBillPreview}
        onClose={() => setShowBillPreview(false)}
        title="View Bill Receipt"
        icon={Receipt}
      >
        {result && (
          <div className="space-y-6 pt-2">
            
            {/* Receipt Header Banner */}
            <div className="text-center pb-4 border-b-2 border-dashed border-slate-200">
              <h4 className="text-sm font-extrabold text-blue-600 tracking-wider uppercase">CredLink Digital Bahi-Khata</h4>
              <p className="text-lg font-bold text-slate-800 mt-1">{merchant?.businessName || 'Sharma General Store'}</p>
              <p className="text-xs text-slate-400">Merchant Receipt</p>
            </div>

            {/* Receipt Specs info */}
            <div className="space-y-4 text-sm font-medium">
              
              <div className="flex justify-between items-center text-xs text-slate-450 font-bold uppercase tracking-wider">
                <span>Receipt No:</span>
                <span className="text-slate-700">{result.transaction.receiptNumber}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Customer Name</span>
                  <span className="text-slate-700 font-bold text-sm block mt-0.5">{selectedCustomer?.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Phone Number</span>
                  <span className="text-slate-700 font-bold text-sm block mt-0.5">{selectedCustomer?.phone || '-'}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-455">Transaction Type:</span>
                  <Badge variant={result.transaction.type === 'CREDIT' ? 'danger' : 'success'}>
                    {result.transaction.type}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-455">Transaction Amount:</span>
                  <span className="font-extrabold text-slate-800">{formatCurrency(result.transaction.amount)}</span>
                </div>

                <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                  <span className="text-slate-455">Previous Balance:</span>
                  <span className="text-slate-605">{formatCurrency(result.transaction.balanceBefore)}</span>
                </div>

                <div className="flex justify-between items-center font-bold text-base border-t border-slate-100 pt-3 text-slate-800">
                  <span>Current Balance:</span>
                  <span className={result.customer.currentBalance > 0 ? 'text-rose-600' : 'text-sky-600'}>
                    {formatCurrency(result.customer.currentBalance)}
                  </span>
                </div>
              </div>

            </div>

            {/* Receipt Footer Message */}
            <div className="text-center border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-400 italic">"Thank you for your business."</p>
              <p className="text-[10px] text-slate-455 mt-0.5">Recorded digitally via CredLink ledger</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={() => {
                  setShowBillPreview(false);
                  setShowWhatsAppModal(true);
                }} 
                icon={MessageCircle}
                className="flex-1 bg-sky-600 hover:bg-sky-700 border-none text-xs !py-3"
              >
                WhatsApp
              </Button>
              <Button 
                variant="secondary"
                onClick={handleDownload} 
                icon={Download}
                className="flex-1 text-xs !py-3"
              >
                Download PDF
              </Button>
            </div>

          </div>
        )}
      </Modal>

      {/* MODAL 2: WHATSAPP EXPERIENCE MODAL */}
      <Modal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        title="Send Bill on WhatsApp? 📱"
        subtitle="Send a digital receipt link immediately"
        icon={MessageCircle}
      >
        {result && (
          <div className="space-y-4 pt-2">
            
            <div className="space-y-3.5 text-xs text-slate-500 font-medium">
              <div className="flex justify-between items-center text-slate-650">
                <span>Customer Name:</span>
                <strong className="text-slate-800 font-bold">{selectedCustomer?.name}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-650">
                <span>Customer Phone:</span>
                <strong className="text-slate-800 font-bold">{selectedCustomer?.phone || '98XXXXXX12'}</strong>
              </div>

              {/* Message preview text-box */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Message Preview</label>
                <div className="w-full bg-sky-50/50 rounded-2xl p-4 border border-sky-100/50 text-sky-950 font-mono text-[11px] leading-relaxed whitespace-pre-wrap select-all">
                  {`Hello ${selectedCustomer?.name || 'Customer'},\nYour transaction has been recorded in CredLink.\n\nAmount: ${formatCurrency(result.transaction.amount)}\nType: ${result.transaction.type === 'CREDIT' ? 'Credit (Udhaar)' : 'Payment (Jama)'}\nCurrent Balance: ${formatCurrency(result.customer.currentBalance)}\n\nYour digital receipt is generated and stored securely.`}
                </div>
              </div>

              <p className="text-[10px] text-slate-455 text-center leading-relaxed">
                If the WhatsApp automated API fails, CredLink will open WhatsApp Web or WhatsApp App with the pre-filled message for sharing manually.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 pt-2">
              <Button 
                variant="secondary"
                onClick={() => setShowWhatsAppModal(false)} 
                className="flex-1 text-xs !py-3"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleWhatsAppSend} 
                disabled={sendingWhatsapp}
                icon={MessageCircle}
                className="flex-1 text-xs !py-3 bg-sky-600 hover:bg-sky-700 border-none shadow-sm shadow-sky-500/10"
              >
                {sendingWhatsapp ? 'Sending...' : 'Send WhatsApp'}
              </Button>
            </div>

          </div>
        )}
      </Modal>

    </Layout>
  );
}
