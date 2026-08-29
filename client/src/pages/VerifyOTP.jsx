import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShieldCheck, Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { verifyOtp, sendOtp } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button.jsx';

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const email = location.state?.email;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(30);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) navigate('/login');
  }, [email, navigate]);

  // Countdown timer effect
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (idx, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[idx] = value;
    setOtp(next);
    // Auto-focus next input
    if (value && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Enter the full 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const { data } = await verifyOtp(email, code);
      // Wait a tiny bit for a success state representation
      toast.success('Successful verification! 🎉');
      login(data.data.token, data.data.merchant);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setResending(true);
    try {
      const { data } = await sendOtp(email);
      setTimer(30);
      toast.success(data.data.devMode ? 'New OTP generated in server console 🛠️' : 'OTP resent successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF9] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[32px] p-8 md:p-10 shadow-soft-lg border border-slate-100/80 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-600">
            <Mail size={24} className="animate-bounce" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Check your inbox ✉️</h1>
            <p className="text-sm text-slate-400 mt-1">
              Enter the 6-digit code sent to
            </p>
            <p className="text-sm font-semibold text-slate-700">{email}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-between gap-1.5 sm:gap-2.5">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputsRef.current[idx] = el)}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                maxLength={1}
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-2xl border border-slate-200/80 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-brand-500 transition-all bg-white"
                autoFocus={idx === 0}
              />
            ))}
          </div>

          <Button type="submit" loading={loading} className="w-full py-4 text-sm font-bold shadow-md shadow-blue-500/10">
            Verify & Continue
          </Button>
        </form>

        {/* Footer Actions */}
        <div className="flex flex-col items-center gap-3 pt-2 text-center text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1.5 justify-center">
            {timer > 0 ? (
              <span>Resend OTP in <strong className="text-blue-600 font-bold">{timer}s</strong></span>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 font-bold"
              >
                <RefreshCw size={12} className={resending ? 'animate-spin' : ''} />
                <span>Resend OTP</span>
              </button>
            )}
          </div>

          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 hover:underline"
          >
            <ArrowLeft size={12} />
            <span>Change Email Address</span>
          </button>
        </div>

      </div>
    </div>
  );
}
