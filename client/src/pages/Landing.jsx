import { Link } from 'react-router-dom';
import { Mic, FileText, MessageCircle, Wallet, ArrowRight, ArrowDown, Check, Sparkles } from 'lucide-react';

const features = [
  { icon: Mic, title: 'Voice Entry', desc: 'Speak naturally in Hindi, Hinglish, or English. No typing needed.' },
  { icon: Wallet, title: 'Credit Ledger', desc: 'Accurately track customer balances, total credits, and payments.' },
  { icon: FileText, title: 'Instant Bills', desc: 'Professional PDF bills are automatically generated in real-time.' },
  { icon: MessageCircle, title: 'WhatsApp Sharing', desc: 'Send digital receipts and statements directly to customers.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#FCFBF9] text-slate-800 selection:bg-blue-100">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6 sticky top-0 bg-[#FCFBF9]/90 backdrop-blur-md z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center border border-blue-500/10 shadow-sm">
            <Wallet size={20} className="text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-800 tracking-tight block leading-tight font-sans">CredLink</span>
            <span className="text-[10px] text-blue-600 font-semibold tracking-wider uppercase">Bahi-Khata</span>
          </div>
        </div>
        <Link to="/login" className="btn-primary !py-2.5 !px-5 text-sm">
          Merchant Login
        </Link>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column (Content) */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
            <Sparkles size={12} className="animate-spin" />
            <span>Digital Credit Ledger for Indian Merchants</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Your Bahi-Khata,<br />
            <span className="text-blue-600">Now Smarter.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-xl leading-relaxed">
            Speak your transaction. Track your credit. Send the bill. Manage your shop's credit ledger effortlessly in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Link to="/login" className="btn-primary flex items-center justify-center gap-2">
              Start Using CredLink <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="btn-secondary flex items-center justify-center gap-2">
              See How It Works
            </a>
          </div>
        </div>

        {/* Right Column (Interactive Visual Demonstration) */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-md bg-white rounded-[32px] p-6 border border-slate-100 shadow-soft-lg space-y-4">
            
            {/* Visual Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-50">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">How it works</span>
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping"></span>
            </div>

            {/* Workflow Steps Display */}
            <div className="space-y-4 relative">
              {/* Step 1: Voice Input */}
              <div className="flex items-start gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm mic-pulse">
                  <Mic size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">🎙️ Voice Entry</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">"Ramesh ko 500 rupaye udhaar diya"</p>
                </div>
              </div>

              <div className="flex justify-center -my-2">
                <ArrowDown size={14} className="text-slate-300" />
              </div>

              {/* Step 2: Confirmation Screen */}
              <div className="flex items-start gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <Check size={18} className="stroke-[3]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">✓ Transaction Confirmed</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm font-bold text-slate-800">Ramesh Kumar</span>
                    <span className="text-sm font-extrabold text-rose-600">₹500 Credit</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center -my-2">
                <ArrowDown size={14} className="text-slate-300" />
              </div>

              {/* Step 3: Receipt Generated */}
              <div className="flex items-start gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <FileText size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">📄 Bill Generated</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Receipt #CRL-2026-0012</p>
                </div>
              </div>

              <div className="flex justify-center -my-2">
                <ArrowDown size={14} className="text-slate-300" />
              </div>

              {/* Step 4: WhatsApp Share */}
              <div className="flex items-start gap-3 bg-sky-50/50 p-3 rounded-2xl border border-sky-100/50">
                <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-sky-500/10">
                  <MessageCircle size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-sky-600 uppercase tracking-wider">📱 WhatsApp Sent</p>
                  <p className="text-xs font-medium text-sky-700/80 mt-0.5">"Hello Ramesh, your credit of ₹500 has been recorded..."</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-100">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Simplify Your Ledger Book</h2>
          <p className="text-slate-500 mt-2">Ditch paper diaries. Keep your data secure, professional, and accessible instantly on any device.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card flex flex-col justify-between h-full bg-white hover:-translate-y-1 transition-transform">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 border border-blue-100/50 text-blue-600">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 text-center text-slate-400 text-xs">
        <p>&copy; {new Date().getFullYear()} CredLink. Made with ♥ for Indian Shopkeepers.</p>
      </footer>
    </div>
  );
}
