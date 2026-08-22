import React from 'react';
import { Home, BarChart2, Users, Settings } from 'lucide-react';

export type TabType = 'today' | 'progress' | 'challenges' | 'settings';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'today', label: 'Home', icon: Home },
    { id: 'progress', label: 'Stats', icon: BarChart2 },
    { id: 'challenges', label: 'Social', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="w-full bg-white/95 backdrop-blur-md border-t border-blue-50 px-4 py-2 flex items-center justify-around z-30 select-none shadow-sm">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 cursor-pointer ${
              isActive ? 'text-blue-600 font-black scale-105' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1 rounded-xl ${isActive ? 'bg-blue-50 text-blue-600' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 font-bold uppercase tracking-wider">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
