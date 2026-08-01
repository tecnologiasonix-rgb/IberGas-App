import React from 'react';
import { Flame, ShieldAlert, Wrench, Users, PhoneCall, BarChart3, Clock, CheckCircle2 } from 'lucide-react';

export type UserRoleView = 'client' | 'technician' | 'admin';

interface NavbarProps {
  currentRole: UserRoleView;
  onRoleChange: (role: UserRoleView) => void;
  activeRequestsCount: number;
  pendingDocsCount: number;
  totalCommission: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  activeRequestsCount,
  pendingDocsCount,
  totalCommission
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a] backdrop-blur-md border-b border-white/10 shadow-2xl">
      {/* Top Banner Notice */}
      <div className="bg-[#050505] px-4 py-1.5 text-xs text-white/70 border-b border-white/10 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 font-bold text-[11px] border border-red-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              CENTRAL BARCELONA 24/7
            </span>
            <span className="hidden sm:inline text-white/50 text-[11px]">
              Red privada de técnicos certificados en Gas, Electricidad y Fontanería.
            </span>
          </div>

          <div className="flex items-center gap-4 text-white/60 text-[11px]">
            <span className="hidden md:flex items-center gap-1 text-green-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Intermediación Directa Garantizada (30%)
            </span>
            <a
              href="tel:+34930000930"
              className="flex items-center gap-1.5 font-bold text-white hover:text-red-400 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-500 animate-bounce" />
              <span>930 000 930</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onRoleChange('client')}>
          <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-red-600/30">
            U
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">
                URGENT<span className="text-red-500">BCN</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-white/60 uppercase tracking-widest border border-white/10">
                Control Central
              </span>
            </div>
            <p className="text-[10px] text-white/40 font-medium tracking-wide uppercase">
              Gas · Electricidad · Fontanería
            </p>
          </div>
        </div>

        {/* Role Mode Switcher Tabs */}
        <div className="flex items-center gap-1 bg-[#050505] p-1 rounded-xl border border-white/10">
          <button
            onClick={() => onRoleChange('client')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentRole === 'client'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Cliente SOS</span>
            {activeRequestsCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-bold">
                {activeRequestsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onRoleChange('technician')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentRole === 'technician'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Portal Técnico</span>
            {pendingDocsCount > 0 && (
              <span className="ml-0.5 w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => onRoleChange('admin')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentRole === 'admin'
                ? 'bg-white/10 text-white border border-white/20 shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-green-400" />
            <span className="hidden sm:inline">Central Intermediación</span>
            <span className="sm:hidden">Central</span>
            <span className="hidden lg:inline-block text-[11px] text-green-400 font-serif italic bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
              +{totalCommission.toFixed(0)}€
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
