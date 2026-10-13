import React from 'react';
import {
  LayoutDashboard,
  Clock,
  HeartPulse,
  Activity,
  Pill,
  FolderLock,
  Stethoscope,
  Sparkles,
  CalendarDays,
  UserCheck,
  ShieldAlert,
  Info,
  Mic,
  Bot,
  Flame,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'womens_health'
  | 'pregnancy'
  | 'menstrual'
  | 'voice'
  | 'assistant'
  | 'risks'
  | 'timeline'
  | 'checkin'
  | 'symptoms'
  | 'medications'
  | 'documents'
  | 'consultations'
  | 'summary'
  | 'appointments'
  | 'profile';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  counts: {
    symptoms: number;
    medications: number;
    documents: number;
    consultations: number;
    checkins: number;
    timeline: number;
    cycles?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, counts }) => {
  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'womens_health', label: '🌸 Women’s Health Hub', icon: HeartPulse, badgeColor: 'bg-rose-100 text-rose-800' },
    { id: 'pregnancy', label: 'Pregnancy Journey', icon: Activity, badgeColor: 'bg-rose-50 text-rose-700' },
    { id: 'menstrual', label: 'Menstrual Cycle', icon: HeartPulse, count: counts.cycles },
    { id: 'timeline', label: 'Health Timeline', icon: Clock, count: counts.timeline, badgeColor: 'bg-teal-100 text-teal-800' },
    { id: 'summary', label: 'Doctor Summary (AI)', icon: Sparkles, badgeColor: 'bg-indigo-100 text-indigo-700' },
    { id: 'checkin', label: 'Daily Check-in', icon: HeartPulse, count: counts.checkins },
    { id: 'symptoms', label: 'Symptom Tracker', icon: Activity, count: counts.symptoms },
    { id: 'documents', label: 'Reports & Documents', icon: FolderLock, count: counts.documents },
    { id: 'appointments', label: 'Appointments & Reminders', icon: CalendarDays },
    { id: 'assistant', label: 'AI Health & Gyn Assistant', icon: Bot, badgeColor: 'bg-cyan-100 text-cyan-800' },
    { id: 'voice', label: '🎙 Voice Assistant', icon: Mic, badgeColor: 'bg-teal-100 text-teal-800' },
    { id: 'medications', label: 'Medications', icon: Pill, count: counts.medications },
    { id: 'consultations', label: 'Doctor Consults', icon: Stethoscope, count: counts.consultations },
    { id: 'risks', label: 'Health Risks & Tobacco', icon: Flame, badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 'profile', label: 'Profile & Privacy', icon: UserCheck },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)] no-print">
      <div className="p-4 space-y-6">
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Patient Portal
          </p>
          <nav className="space-y-0.5" aria-label="Sidebar navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-teal-50 text-teal-900 font-semibold shadow-2xs border border-teal-200/60'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-teal-600' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-teal-600 text-white'
                          : item.badgeColor || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Fictional Scenario Banner */}
        <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-xs text-amber-900 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-950">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Fictional Demo Scenario</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Loaded: <strong>Oct 2025 Ear Pain & Recurrence</strong> after travel. Shows connected timeline & pre-consultation summary draft.
          </p>
        </div>
      </div>

      {/* Safety & Medical Disclaimers */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/60 space-y-2">
        <div className="flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
          <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            <strong>Medical Notice:</strong> Not a diagnostic tool. In case of emergency, call your local emergency service (e.g., 911).
          </span>
        </div>
      </div>
    </aside>
  );
};
