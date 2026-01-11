import React from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
    children: React.ReactNode;
    activeTab: 'cari' | 'gider';
    onTabChange: (tab: 'cari' | 'gider') => void;
    onHelpClick: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onHelpClick }) => {
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
                <div data-tauri-drag-region className="h-8 w-full shrink-0 flex items-center justify-end px-4 select-none">
                    {/* Pencere kontrol butonları gerekirse buraya eklenebilir, şimdilik boş bırakıyorum çünkü OS kendi butonlarını çiziyor olabilir veya custom yapılacak */}
                </div>

                {/* Sayfa İçeriği */}
                <div className="flex-1 overflow-auto p-6 scroll-smooth">
                    {children}
                </div>
            </main>
        </div>
    );
};
