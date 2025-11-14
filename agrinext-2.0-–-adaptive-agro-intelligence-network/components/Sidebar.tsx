
import React from 'react';
import type { View } from '../types';
import { DashboardIcon } from './icons/DashboardIcon';
import { LeafIcon } from './icons/LeafIcon';
import { ChatIcon } from './icons/ChatIcon';
import { PlanIcon } from './icons/PlanIcon';


interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'pest-detection', label: 'Pest Detection', icon: <LeafIcon /> },
    { id: 'crop-advisory', label: 'Crop Advisory', icon: <ChatIcon /> },
    { id: 'smart-plan', label: 'Smart Plan', icon: <PlanIcon /> },
  ];

  return (
    <aside className="w-16 md:w-64 bg-slate-800 text-white flex flex-col transition-all duration-300">
      <div className="h-16 flex items-center justify-center md:justify-start md:px-6 shrink-0">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="font-bold text-white">A</span>
        </div>
        <h1 className="hidden md:block text-xl font-bold ml-3">AgriNext</h1>
      </div>
      <nav className="flex-1 px-2 md:px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as View)}
            className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 ${
              currentView === item.id
                ? 'bg-primary text-white'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <div className="w-6 h-6">{item.icon}</div>
            <span className="hidden md:block ml-4 font-semibold">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
