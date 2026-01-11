import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWebview } from '@tauri-apps/api/webview';
import { X, UploadCloud, AlertTriangle, FileUp } from 'lucide-react';
import { cn } from '../lib/utils';

interface BackupModalProps {
    onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ onClose }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    // Alternative: Use Dialog Open
    const handlePickFile = async () => {
        // Dynamic import
        const { open } = await import('@tauri-apps/plugin-dialog');
        const file = await open({
            multiple: false,
            filters: [{
                name: 'Database',
                extensions: ['db']
            }]
        });

        if (file) {
            // file is path string or null
            restore(file);
        }
    };

    // Listen for file drop
    React.useEffect(() => {
        const unlisten = getCurrentWebview().onDragDropEvent((event) => {
            if (event.payload.type === 'drop') {
                const paths = event.payload.paths;
                if (paths.length > 0) {
                    const path = paths[0];
                    if (path.endsWith('.db')) {
                        restore(path);
                    } else {
                        setError("Lütfen geçerli bir .db uzantılı yedek dosyası seçin.");
                    }
                }
            }
        });

        return () => {
            unlisten.then(f => f());
        };
    }, []);

    const restore = async (path: string) => {
        if (!confirm("DİKKAT! Bu işlem mevcut verilerinizi silecek ve seçtiğiniz yedeğe geri dönecektir. Emin misiniz?")) return;

        setLoading(true);
        setError(null);
        try {
            await invoke('restore_backup', { filePath: path });
            alert("Yedek başarıyla yüklendi. Uygulama yeniden başlatılıyor...");
        } catch (err: any) {
            console.error(err);
            setError(typeof err === 'string' ? err : "Geri yükleme başarısız oldu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X /></button>

                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <UploadCloud className="text-accent" />
                    Yedekten Geri Yükle
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                    Bilgisayarınızdaki <code>backups</code> klasöründeki bir yedek dosyasını (.db) aşağıya sürükleyin veya seçin.
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg flex items-center gap-2 text-sm">
                        <AlertTriangle size={16} />
                        {error}
                    </div>
                )}

                <div
                    className={cn(
                        "border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer",
                        isDragging ? "border-accent bg-accent/10 scale-105" : "border-white/20 hover:border-white/40 hover:bg-white/5",
                        loading && "opacity-50 pointer-events-none"
                    )}
                    onClick={handlePickFile}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    {loading ? (
                        <div className="flex flex-col items-center gap-2 text-accent">
                            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                            <span>Geri yükleniyor...</span>
                        </div>
                    ) : (
                        <>
                            <div className="p-4 rounded-full bg-slate-800">
                                <FileUp size={32} className="text-slate-400" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-white">Dosyayı Buraya Sürükleyin</p>
                                <p className="text-xs text-slate-500 mt-1">veya tıklayarak seçin</p>
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <h4 className="flex items-center gap-2 text-yellow-400 font-bold text-sm mb-1">
                        <AlertTriangle size={14} />
                        Önemli Uyarı
                    </h4>
                    <p className="text-xs text-yellow-200/80">
                        Geri yükleme işlemi, mevcut "market.db" dosyanızı ".old" uzantısıyla yedekler ancak veritabanını tamamen seçtiğiniz dosya ile değiştirir. Lütfen dikkatli olun.
                    </p>
                </div>

            </div>
        </div>
    );
};
