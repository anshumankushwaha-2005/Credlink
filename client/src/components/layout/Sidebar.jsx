import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Mic, Receipt, FileText, BarChart3, User, Wallet } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../context/LanguageContext';

const links = [
  { to: '/dashboard', key: 'dashboard', icon: LayoutDashboard },
  { to: '/customers', key: 'customers', icon: Users },
  { to: '/voice', key: 'voiceEntry', icon: Mic },
  { to: '/transactions', key: 'recentTransactions', icon: Receipt },
  { to: '/bills', key: 'billingHistory', icon: FileText },
  { to: '/reports', key: 'ledgerBook', icon: BarChart3 },
  { to: '/profile', key: 'profile', icon: User },
];

export default function Sidebar() {
  const { merchant } = useAuth();
  const { t } = useTranslation();

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-slate-100/80 h-screen sticky top-0 py-6 px-4 justify-between">
      <div className="space-y-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
            <Wallet size={20} className="text-blue-600 animate-pulse" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-800 tracking-tight block leading-tight font-sans">CredLink</span>
            <span className="text-[10px] text-blue-600 font-semibold tracking-wider uppercase">Bahi-Khata</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {links.map(({ to, key, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50/70 text-blue-700 font-semibold shadow-sm shadow-blue-500/5'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`
              }
            >
              <Icon size={18} />
              <span>{t(key)}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Sidebar Footer Merchant Profile */}
      {merchant && (
        <div className="border-t border-slate-50 pt-4 flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-blue-100/60 flex items-center justify-center text-blue-700 font-bold text-sm border border-blue-200/50">
            {merchant.name ? merchant.name.charAt(0).toUpperCase() : 'M'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate leading-tight">{merchant.name}</p>
            <p className="text-xs text-slate-400 truncate mt-0.5">{merchant.businessName}</p>
          </div>
        </div>
      )}
    </aside>
  );
}
