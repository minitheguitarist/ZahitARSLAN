import { getCurrentWindow } from '@tauri-apps/api/window';
import { Sidebar } from './Sidebar';
import { X, Minus, Square } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
    activeTab: 'cari' | 'gider';
    onTabChange: (tab: 'cari' | 'gider') => void;
    onHelpClick: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onHelpClick }) => {
    const appWindow = getCurrentWindow();

    const handleClose = async () => {
        await appWindow.close();
    };

    const handleMinimize = async () => {
        await appWindow.minimize();
    };

    const handleMaximize = async () => {
        await appWindow.toggleMaximize();
    };

    return (
        <div className="flex w-full h-screen overflow-hidden bg-slate-900 text-white relative">
            {/* Arka plan efektleri */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[100px]"></div>
                <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[100px]"></div>
            </div>

            {/* Sidebar */}
            <Sidebar activeTab={activeTab} onTabChange={onTabChange} onHelpClick={onHelpClick} />

            {/* Ana İçerik */}
            <main className="flex-1 h-full overflow-hidden relative z-10 flex flex-col">
                {/* Özel Başlık Çubuğu (Drag Region) */}
                <div data-tauri-drag-region className="h-10 w-full shrink-0 flex items-center justify-end px-2 gap-1 select-none z-50">
                    <button
                        onClick={handleMinimize}
                        className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all duration-200"
                        title="Küçült"
                    >
                        <Minus size={18} />
                    </button>
                    <button
                        onClick={handleMaximize}
                        className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all duration-200"
                        title="Büyüt / Küçült"
                    >
                        <Square size={16} />
                    </button>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-lg text-slate-400 hover:bg-red-500 hover:text-white transition-all duration-200"
                        title="Kapat"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Sayfa İçeriği */}
                <div className="flex-1 overflow-auto p-6 scroll-smooth">
                    {children}
                </div>
            </main>
        </div>
    );
};
