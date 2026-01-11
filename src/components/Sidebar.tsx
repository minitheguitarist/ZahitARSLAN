import React from 'react';
import { LayoutDashboard, Calculator, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
    activeTab: 'cari' | 'gider';
    onTabChange: (tab: 'cari' | 'gider') => void;
    onHelpClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onHelpClick }) => {
    return (
        <div className="w-64 h-full flex flex-col glass-panel border-r border-white/10 relative z-20">
            {/* Logo Alanı */}
            <div className="p-8 flex flex-col items-center justify-center border-b border-white/5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center shadow-lg mb-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-accent/20 blur-xl group-hover:bg-accent/30 transition-all duration-500"></div>
                    <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-accent relative z-10">ZA</span>
                </div>
                <h1 className="text-xl font-bold text-white tracking-wide">Zahit ARSLAN</h1>
                <p className="text-xs text-slate-400 mt-1">Cari & Gider Takip</p>
            </div>

            {/* Menü */}
            <nav className="flex-1 p-4 space-y-2 mt-4">
                <button
                    onClick={() => onTabChange('cari')}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                        activeTab === 'cari'
                            ? "bg-accent/20 text-accent border border-accent/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                    )}
                >
                    <LayoutDashboard size={20} className={cn("transition-transform duration-300", activeTab === 'cari' ? "scale-110" : "group-hover:scale-110")} />
                    <span className="font-medium">Cari Kontrol</span>
                </button>

                <button
                    onClick={() => onTabChange('gider')}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                        activeTab === 'gider'
                            ? "bg-accent/20 text-accent border border-accent/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                    )}
                >
                    <Calculator size={20} className={cn("transition-transform duration-300", activeTab === 'gider' ? "scale-110" : "group-hover:scale-110")} />
                    <span className="font-medium">Gider Hesaplama</span>
                </button>
            </nav>

            {/* Alt Footer */}
            <div className="p-4 border-t border-white/5">
                <button
                    onClick={onHelpClick}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-300 group"
                >
                    <div className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-slate-700 transition-colors">
                        <HelpCircle size={18} />
                    </div>
                    <span className="font-medium">Yardım & Yedek</span>
                </button>
            </div>
        </div>
    );
};
