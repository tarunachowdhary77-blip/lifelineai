import React from 'react';
import {
  LayoutDashboard,
  Clock,
  HeartPulse,
  Pill,
  Sparkles,
  Layers,
  Mic,
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface MobileNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenMoreMenu: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenMoreMenu,
}) => {
  const mainItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'womens_health', label: 'Women', icon: HeartPulse },
    { id: 'voice', label: 'Voice', icon: Mic },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'summary', label: 'Summary', icon: Sparkles },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg no-print">
      <div className="flex items-center justify-around">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center py-1.5 px-2 rounded-xl transition-colors ${
                isActive ? 'text-teal-600 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}

        <button
          onClick={onOpenMoreMenu}
          className="flex flex-col items-center py-1.5 px-2 rounded-xl text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">More</span>
        </button>
      </div>
    </div>
  );
};
