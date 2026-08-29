import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Wallet, Mail, ArrowRight, Store, ShieldCheck, Globe } from 'lucide-react';
import { sendOtp } from '../services/authService';
import { isValidEmail } from '../utils/validators';
import { useTranslation, languagesList } from '../context/LanguageContext';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { language, setLanguage, t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      const { data } = await sendOtp(email);
      if (data.data.devMode) {
        toast.success('Development OTP generated. Check your server console! 🛠️', { duration: 5000 });
      } else {
        toast.success('OTP sent successfully to your email ✉️');
      }
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF9] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-[32px] overflow-hidden shadow-soft-lg border border-slate-100 animate-slide-up">
        
        {/* Left Side: Auth Form */}
        <div className="p-8 md:p-12 flex flex-col justify-between">
          {/* Brand Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                <Wallet size={18} className="text-white" />
              </div>
              <span className="text-base font-bold text-slate-800 tracking-tight leading-none">CredLink</span>
            </div>
            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/50 rounded-xl px-2 py-1 transition-all">
              <Globe size={12} className="text-slate-400 shrink-0" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-[10px] font-bold text-slate-600 focus:outline-none cursor-pointer border-none"
              >
                {languagesList.map((lang) => (
                  <option key={lang.code} value={lang.code} className="text-slate-700 bg-white text-xs">
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Content */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome back 👋</h1>
              <p className="text-sm text-slate-400 mt-1">Manage your shop's credit with ease.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="merchant@email.com"
                icon={Mail}
                autoFocus
                required
              />

              <Button 
                type="submit" 
                loading={loading} 
                className="w-full py-4 text-sm font-bold shadow-md shadow-blue-500/10"
              >
                <span>Send OTP</span>
                <ArrowRight size={16} />
              </Button>
            </form>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              We'll send a secure OTP to your email.<br />No password needed. Keep your account clean.
            </p>
          </div>
          {/* Demo account card removed */}
        </div>

        {/* Right Side: Friendly Illustration Banner */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-50 to-blue-100/30 border-l border-slate-50 relative overflow-hidden">
          <div className="absolute top-1/4 -right-10 w-48 h-48 bg-white/40 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 -left-10 w-36 h-36 bg-blue-200/20 rounded-full blur-xl"></div>
          
          <div className="relative z-10 space-y-4 max-w-xs">
            <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-sm">
              <Store size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-snug">"CredLink has saved me hours of manual bookkeeping."</h2>
            <p className="text-xs text-slate-400 font-medium">— Kirana Store Owner, Delhi</p>
          </div>

          {/* Features checkmark badge list */}
          <div className="relative z-10 space-y-3.5 mt-8">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 animate-slide-up delay-1">
              <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0"><ShieldCheck size={12} /></div>
              <span>100% Safe & Digital Ledger</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 animate-slide-up delay-2">
              <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0"><ShieldCheck size={12} /></div>
              <span>No Internet required for Customers</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 animate-slide-up delay-3">
              <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0"><ShieldCheck size={12} /></div>
              <span>Automatic Reminders on WhatsApp</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
