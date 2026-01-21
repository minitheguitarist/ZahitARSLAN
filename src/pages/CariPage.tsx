import React, { useState, useEffect } from 'react';
import { CalendarView } from '../components/CalendarView';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { getDailyRecord, saveDailyRecord, DailyRecord } from '../lib/db';
import { cn } from '../lib/utils';

export const CariPage: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<DailyRecord>({
        date: '',
        ana_kasa_nakit: 0,
        ana_kasa_visa: 0,
        pc_nakit: 0,
        pc_visa: 0,
    });

    // Toplam hesaplamaları
    const anaKasaToplam = (data.ana_kasa_nakit || 0) + (data.ana_kasa_visa || 0);
    const pcToplam = (data.pc_nakit || 0) + (data.pc_visa || 0);
    const fark = anaKasaToplam - pcToplam;

    // Tarih seçilince veriyi veritabanından çek
    useEffect(() => {
        if (selectedDate) {
            // Yerel saati dikkate alarak YYYY-MM-DD formatına çevir
            const offset = selectedDate.getTimezoneOffset();
            const localDate = new Date(selectedDate.getTime() - (offset * 60 * 1000));
            const dateStr = localDate.toISOString().split('T')[0];

            loadData(dateStr);
        }
    }, [selectedDate]);

    const loadData = async (dateStr: string) => {
        setLoading(true);
        try {
            const record = await getDailyRecord(dateStr);
            if (record) {
                setData(record);
            } else {
                // Kayıt yoksa varsayılan boş veri
                setData({
                    date: dateStr,
                    ana_kasa_nakit: 0,
                    ana_kasa_visa: 0,
                    pc_nakit: 0,
                    pc_visa: 0,
                });
            }
        } catch (error) {
            console.error("Veri yüklenirken hata:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof DailyRecord, value: string) => {
        // Boş string gelirse 0 yap, yoksa sayıya çevir
        const numValue = value === '' ? 0 : parseFloat(value);

        // Eğer veri NaN ise (geçersiz karakter) eski değeri koru veya 0 yap
        if (isNaN(numValue)) return;

        setData(prev => ({ ...prev, [field]: numValue }));
    };

    const handleSave = async () => {
        if (!selectedDate) return;
        setLoading(true);
        try {
            await saveDailyRecord(data);
            // İsteğe bağlı: Kullanıcıya başarı mesajı için toast eklenebilir
            // alert("Veriler kaydedildi!"); 
        } catch (error) {
            console.error("Kaydetme hatası:", error);
            alert("Kaydedilemedi! Hata detayı: " + error);
        } finally {
            setTimeout(() => setLoading(false), 500); // UI hissiyatı için kısa gecikme
        }
    };

    const resetView = () => {
        setSelectedDate(null);
        setData({ date: '', ana_kasa_nakit: 0, ana_kasa_visa: 0, pc_nakit: 0, pc_visa: 0 });
    };

    // 1. Ekran: Takvim
    if (!selectedDate) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4 fade-in">
                <CalendarView onDateSelect={setSelectedDate} />
            </div>
        );
    }

    // 2. Ekran: Veri Girişi
    return (
        <div className="w-full p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={resetView}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg glass-button hover:pl-3 transition-all"
                >
                    <ArrowLeft size={20} />
                    <span>Takvime Dön</span>
                </button>
                <h1 className="text-2xl font-bold text-white">
                    {selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}
                </h1>
                <div className="w-32"></div> {/* Spacer */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Kutu 1: BİLGİSAYAR */}
                <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-6xl font-black text-white">1</span>
                    </div>
                    <h3 className="text-xl font-bold text-center border-b border-white/10 pb-2 text-blue-300">BİLGİSAYAR</h3>

                    <div className="space-y-1">
                        <label className="text-sm text-slate-400 ml-1">Nakit</label>
                        <input
                            type="number"
                            value={data.pc_nakit || ''}
                            onChange={(e) => handleInputChange('pc_nakit', e.target.value)}
                            className="w-full p-3 rounded-lg glass-input text-lg font-mono"
                            placeholder="0.00"
                            onFocus={(e) => e.target.select()}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-slate-400 ml-1">Visa</label>
                        <input
                            type="number"
                            value={data.pc_visa || ''}
                            onChange={(e) => handleInputChange('pc_visa', e.target.value)}
                            className="w-full p-3 rounded-lg glass-input text-lg font-mono"
                            placeholder="0.00"
                            onFocus={(e) => e.target.select()}
                        />
                    </div>

                    <div className="mt-auto pt-4 border-t border-white/10">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Toplam</span>
                            <span className="text-2xl font-bold font-mono text-white">{pcToplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                        </div>
                    </div>
                </div>

                {/* Kutu 2: ANA KASA */}
                <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-6xl font-black text-white">2</span>
                    </div>
                    <h3 className="text-xl font-bold text-center border-b border-white/10 pb-2 text-rose-300">ANA KASA</h3>

                    <div className="space-y-1">
                        <label className="text-sm text-slate-400 ml-1">Nakit</label>
                        <input
                            type="number"
                            value={data.ana_kasa_nakit || ''}
                            onChange={(e) => handleInputChange('ana_kasa_nakit', e.target.value)}
                            className="w-full p-3 rounded-lg glass-input text-lg font-mono"
                            placeholder="0.00"
                            onFocus={(e) => e.target.select()}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-slate-400 ml-1">Visa</label>
                        <input
                            type="number"
                            value={data.ana_kasa_visa || ''}
                            onChange={(e) => handleInputChange('ana_kasa_visa', e.target.value)}
                            className="w-full p-3 rounded-lg glass-input text-lg font-mono"
                            placeholder="0.00"
                            onFocus={(e) => e.target.select()}
                        />
                    </div>

                    <div className="mt-auto pt-4 border-t border-white/10">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Toplam</span>
                            <span className="text-2xl font-bold font-mono text-white">{anaKasaToplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                        </div>
                    </div>
                </div>

                {/* Kutu 3: HESAPLAMA */}
                <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden group border-accent/20">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-6xl font-black text-white">3</span>
                    </div>
                    <h3 className="text-xl font-bold text-center border-b border-white/10 pb-2 text-emerald-300">HESAPLAMA</h3>

                    <div className="flex flex-col gap-2 text-sm text-slate-400 mt-2">
                        <div className="flex justify-between">
                            <span>Bilgisayar Toplamı:</span>
                            <span className="font-mono text-white">{pcToplam.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Ana Kasa Toplamı:</span>
                            <span className="font-mono text-white">{anaKasaToplam.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center py-6">
                        <div className={cn(
                            "text-center p-4 rounded-xl w-full transition-all duration-500 border",
                            fark > 0 ? "bg-emerald-500/20 border-emerald-500/30" :
                                fark < 0 ? "bg-red-500/20 border-red-500/30" :
                                    "bg-slate-500/20 border-slate-500/30"
                        )}>
                            <div className="text-sm font-medium mb-1 opacity-80">
                                {fark > 0 ? 'FAZLALIK' : fark < 0 ? 'AÇIK' : 'NÖTR'}
                            </div>
                            <div className={cn(
                                "text-3xl font-black font-mono",
                                fark > 0 ? "text-emerald-400" :
                                    fark < 0 ? "text-red-400" :
                                        "text-slate-400"
                            )}>
                                {fark > 0 ? '+' : ''}{fark.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full py-4 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-lg shadow-lg shadow-emerald-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Save />}
                        {loading ? 'KAYDEDİLİYOR...' : 'KAYDET'}
                    </button>
                </div>
            </div>
        </div>
    );
};
