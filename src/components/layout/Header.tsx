import React from 'react';
import {
  Activity,
  Sparkles,
  RefreshCw,
  FileText,
  User,
  ShieldCheck,
  Menu,
} from 'lucide-react';
import { PatientProfile } from '../../types';

interface HeaderProps {
  currentPatient: PatientProfile;
  patients: PatientProfile[];
  onSelectPatient: (id: string) => void;
  onResetDemo: () => void;
  onOpenSummary: () => void;
  onToggleMobileMenu: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPatient,
  patients,
  onSelectPatient,
  onResetDemo,
  onOpenSummary,
  onToggleMobileMenu,
  onOpenProfile,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
                <Activity className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-slate-900">
                    LIFELINE<span className="text-teal-600 font-extrabold ml-0.5">AI</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                    Health Chronology
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 tracking-wide hidden sm:block">
                  Your Health Story, Connected.
                </p>
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Patient Switcher */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-2xs">
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-teal-700 rounded-lg transition-colors"
                title="View Patient Profile"
              >
                <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                  {currentPatient.name.charAt(0)}
                </div>
                <span className="hidden md:inline max-w-[140px] truncate">
                  {currentPatient.name}
                </span>
                {currentPatient.isDemoPatient && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    Demo
                  </span>
                )}
              </button>

              {patients.length > 1 && (
                <select
                  value={currentPatient.id}
                  onChange={(e) => onSelectPatient(e.target.value)}
                  className="text-xs bg-transparent border-none text-slate-600 pr-2 py-1 font-medium focus:outline-hidden cursor-pointer"
                  aria-label="Switch patient"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Quick Demo Reset Shortcut */}
            <button
              onClick={onResetDemo}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-xl transition-colors"
              title="Reset to Fictional Demonstration Scenario (Oct 2025 Ear Pain)"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Reset Demo Story</span>
            </button>

            {/* Prepare Doctor Summary CTA Button */}
            <button
              onClick={onOpenSummary}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 rounded-xl shadow-sm shadow-teal-600/30 transition-all hover:shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span className="whitespace-nowrap">Prepare Doctor Summary</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
