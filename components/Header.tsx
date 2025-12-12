import React from 'react';
import { Activity } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-teal-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="bg-teal-500 p-2 rounded-lg text-white shadow-lg shadow-teal-500/30">
              <Activity size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">NeuroScan<span className="text-teal-500">Edit</span></h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">AI Powered Imaging</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;