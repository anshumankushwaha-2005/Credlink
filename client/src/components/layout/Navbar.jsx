import { Globe, LogOut, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { logout as logoutApi } from '../../services/authService';
import { useTranslation, languagesList } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

export default function Navbar({ title }) {
  const { merchant, logout } = useAuth();
  const { language, setLanguage, t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      // ignore
    }
    logout();
    toast.success('Logged out successfully 👋');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-100/60 px-4 md:px-8 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">{title}</h1>
        {merchant && (
          <p className="text-xs text-blue-600 font-medium mt-0.5">{merchant.businessName}</p>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Language selector */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/50 rounded-xl px-2 py-1.5 transition-all">
          <Globe size={13} className="text-slate-400 shrink-0" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent text-[10px] sm:text-[11px] font-bold text-slate-600 focus:outline-none cursor-pointer border-none pr-1"
          >
            {languagesList.map((lang) => (
              <option key={lang.code} value={lang.code} className="text-slate-700 bg-white text-xs">
                {lang.code === 'hinglish' ? 'Hinglish' : lang.name.split(' ')[0]}
              </option>
            ))}
          </select>
        </div>

        {merchant && (
          <Link to="/profile" className="hidden sm:flex items-center gap-2 hover:bg-slate-50 px-2.5 py-1.5 rounded-xl transition-all duration-200">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100/60 text-blue-700 font-bold text-xs">
              {merchant.name ? merchant.name.charAt(0).toUpperCase() : 'M'}
            </div>
            <span className="text-xs font-semibold text-slate-700">{merchant.name}</span>
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 px-3 py-2 rounded-xl transition-all duration-200"
        >
          <LogOut size={14} />
          <span>{t('logout')}</span>
        </button>
      </div>
    </header>
  );
}
