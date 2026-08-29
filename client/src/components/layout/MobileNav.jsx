import { NavLink } from 'react-router-dom';
import { Home, Users, Mic, FileText, Menu } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

export default function MobileNav() {
  const { t } = useTranslation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-100/80 flex items-center justify-around py-2.5 z-40 px-2 shadow-lg shadow-slate-100">
      
      {/* Home */}
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 flex-1 py-1 transition-colors duration-200 ${
            isActive ? 'text-blue-600 font-bold' : 'text-slate-400 font-medium'
          }`
        }
      >
        <Home size={20} />
        <span className="text-[10px]">{t('dashboard')}</span>
      </NavLink>

      {/* Customers */}
      <NavLink
        to="/customers"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 flex-1 py-1 transition-colors duration-200 ${
            isActive ? 'text-blue-600 font-bold' : 'text-slate-400 font-medium'
          }`
        }
      >
        <Users size={20} />
        <span className="text-[10px]">{t('customers')}</span>
      </NavLink>

      {/* Voice (Floating & Emphasized) */}
      <NavLink
        to="/voice"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center -mt-6 w-14 h-14 rounded-full shadow-lg border-4 border-white transition-all duration-300 active:scale-95 ${
            isActive 
              ? 'bg-blue-600 text-white shadow-blue-500/30' 
              : 'bg-blue-500 text-white shadow-blue-500/20'
          }`
        }
      >
        <Mic size={24} className="animate-pulse" />
      </NavLink>

      {/* Bills */}
      <NavLink
        to="/bills"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 flex-1 py-1 transition-colors duration-200 ${
            isActive ? 'text-blue-600 font-bold' : 'text-slate-400 font-medium'
          }`
        }
      >
        <FileText size={20} />
        <span className="text-[10px]">{t('billingHistory')}</span>
      </NavLink>

      {/* More (Profile & Settings) */}
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 flex-1 py-1 transition-colors duration-200 ${
            isActive ? 'text-blue-600 font-bold' : 'text-slate-400 font-medium'
          }`
        }
      >
        <Menu size={20} />
        <span className="text-[10px]">{t('profile')}</span>
      </NavLink>

    </nav>
  );
}
