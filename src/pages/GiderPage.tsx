import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, Plus, Trash2, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import {
    Expense,
    getExpenses,
    addExpense,
    deleteExpense,
    updateExpensePaidStatus,
    getPeriodStatus,
    setPeriodStatus,
    getCategoryTotal
} from '../lib/db';

type ViewMode = 'period-select' | 'categories' | 'expense-list' | 'market-summary';

const CATEGORIES = [
    { id: 'ELEKTRİK', label: 'ELEKTRİK', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { id: 'İNTERNET', label: 'İNTERNET', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'BAĞKUR', label: 'BAĞKUR', color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { id: 'CEP TELEFONLARI', label: 'CEP TELEFONLARI', color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { id: 'DOĞAL GAZ', label: 'DOĞAL GAZ', color: 'text-red-400', bg: 'bg-red-400/10' },
    { id: 'MARKET GİDERLERİ', label: 'MARKET GİDERLERİ', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
];

const MONTHS = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export const GiderPage: React.FC = () => {
    const [view, setView] = useState<ViewMode>('period-select');
    const [year, setYear] = useState(2026);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null); // 0-11
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Data State
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(false);
    const [periodStatus, setPeriodStatusValue] = useState(false); // Ay ödendi mi?
    const [periodStatusMap, setPeriodStatusMap] = useState<Record<string, boolean>>({});
    const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});

    // Form State for Modal
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<Partial<Expense>>({});

    const periodStr = selectedMonth !== null ? `${year}-${String(selectedMonth + 1).padStart(2, '0')}` : '';

    // --- Functions ---

    const loadExpenses = async () => {
        if (!selectedCategory || !periodStr) return;
        setLoading(true);
        try {
            const data = await getExpenses(periodStr, selectedCategory);
            setExpenses(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Yıl değişince o yılın aylarının durumunu çek
    useEffect(() => {
        const loadStatuses = async () => {
            const statuses: Record<string, boolean> = {};
            for (let i = 0; i < 12; i++) {
                const p = `${year}-${String(i + 1).padStart(2, '0')}`;
                const status = await getPeriodStatus(p);
                statuses[p] = status;
            }
            setPeriodStatusMap(statuses);
        };
        loadStatuses();
    }, [year]);

    // View veya period değişince stateleri güncelle
    useEffect(() => {
        if (view === 'expense-list' || view === 'market-summary') {
            loadExpenses();
        }
        if (view === 'market-summary' && periodStr) {
            // Load totals for all categories
            (async () => {
                const totals: Record<string, number> = {};
                for (const cat of CATEGORIES) {
                    totals[cat.id] = await getCategoryTotal(periodStr, cat.id);
                }
                setCategoryTotals(totals);
            })();
        }
        if (periodStr) {
            getPeriodStatus(periodStr).then(setPeriodStatusValue);
        }
    }, [view, selectedCategory, periodStr]);

    const handleMonthSelect = async (monthIndex: number) => {
        setSelectedMonth(monthIndex);
        setView('categories');
    };

    const handleCategorySelect = (catId: string) => {
        setSelectedCategory(catId);
        if (catId === 'MARKET GİDERLERİ') {
            setView('market-summary');
        } else {
            setView('expense-list');
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Silmek istediğinize emin misiniz?')) {
            await deleteExpense(id);
            loadExpenses();
        }
    };

    const handleTogglePaid = async (id: number, current: boolean) => {
        await updateExpensePaidStatus(id, !current);
        loadExpenses();
    };

    const handleTogglePeriodPaid = async () => {
        if (!periodStr) return;
        const newValue = !periodStatus;
        await setPeriodStatus(periodStr, newValue);
        setPeriodStatusValue(newValue);

        // Update map locally so we don't need full reload
        setPeriodStatusMap(prev => ({ ...prev, [periodStr]: newValue }));
    };

    const handleModalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!periodStr || !selectedCategory) return;

        const newExpense: Expense = {
            period: periodStr,
            category: selectedCategory,
            title: formData.title || '',
            number: formData.number,
            amount: Number(formData.amount) || 0,
            is_paid: formData.is_paid || false,
            sub_category: formData.sub_category
        };

        await addExpense(newExpense);
        setShowModal(false);
        setFormData({});
        loadExpenses();
    };

    // --- Views ---

    if (view === 'period-select') {
        return (
            <div className="w-full mx-auto animate-in fade-in">
                <div className="flex items-center justify-between mb-8 glass-panel p-4 rounded-xl">
                    <button onClick={() => setYear(y => Math.max(2026, y - 1))} className={cn("p-2 rounded-lg hover:bg-white/10", year <= 2026 && "opacity-50 cursor-not-allowed")} disabled={year <= 2026}><ChevronLeft /></button>
                    <h2 className="text-3xl font-bold font-mono">{year}</h2>
                    <button onClick={() => setYear(y => y + 1)} className="p-2 rounded-lg hover:bg-white/10"><ChevronRight /></button>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                    {MONTHS.map((m, idx) => {
                        const p = `${year}-${String(idx + 1).padStart(2, '0')}`;
                        const isPaid = periodStatusMap[p];
                        return (
                            <button
                                key={idx}
                                onClick={() => handleMonthSelect(idx)}
                                className={cn(
                                    "glass-panel p-6 rounded-xl hover:bg-accent/10 hover:border-accent/50 transition-all flex flex-col items-center gap-2 group relative overflow-hidden",
                                    isPaid && "border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                )}
                            >
                                <span className={cn("text-xl font-medium group-hover:text-accent transition-colors", isPaid ? "text-emerald-400" : "")}>{m}</span>
                                {isPaid && <div className="absolute top-2 right-2 text-emerald-400"><CheckCircle size={16} /></div>}
                            </button>
                        )
                    })}
                </div>
            </div>
        );
    }

    if (view === 'categories') {
        return (
            <div className="w-full mx-auto animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => setView('period-select')} className="p-2 rounded-lg glass-button"><ArrowLeft /></button>
                    <h2 className="text-2xl font-bold text-slate-300">
                        {MONTHS[selectedMonth!]} {year} <span className="text-slate-500">/ Kategoriler</span>
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategorySelect(cat.id)}
                            className={cn(
                                "h-40 glass-panel rounded-2xl flex flex-col items-center justify-center gap-4 transition-all hover:scale-105 hover:shadow-xl border-t-4",
                                cat.bg,
                                `border-t-${cat.color.split('-')[1]}-500` // Dynamic border color workaround might need full class
                            )}
                            style={{ borderTopColor: 'currentcolor', color: cat.color.replace('text-', '') /* basic hack */ }}
                        >
                            <div className={cn("text-4xl font-black opacity-80", cat.color)}>
                                {cat.label.charAt(0)}
                            </div>
                            <span className={cn("font-bold tracking-wider", cat.color)}>{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    const currentViewTotal = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    // Calculate Gross Total (All categories) for Market Summary
    const grossTotal = Object.values(categoryTotals).reduce((acc, curr) => acc + curr, 0);

    // --- Market Summary View ---
    if (view === 'market-summary') {
        const otherCategories = CATEGORIES.filter(c => c.id !== 'MARKET GİDERLERİ');

        return (
            <div className="w-full mx-auto h-full flex flex-col animate-in slide-in-from-right-8">
                <div className="flex items-center justify-between mb-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView('categories')} className="p-2 rounded-lg glass-button"><ArrowLeft /></button>
                        <div>
                            <h2 className="text-2xl font-bold text-emerald-400">MARKET GİDERLERİ ÖZETİ</h2>
                            <span className="text-sm text-slate-500">{MONTHS[selectedMonth!]} {year}</span>
                        </div>
                    </div>

                    {/* Master Checkbox */}
                    <button
                        onClick={handleTogglePeriodPaid}
                        className={cn(
                            "flex items-center gap-3 px-6 py-3 rounded-xl border transition-all",
                            periodStatus
                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                : "bg-slate-800/50 border-white/10 text-slate-400 hover:border-white/30"
                        )}
                    >
                        <div className={cn("w-6 h-6 rounded border flex items-center justify-center transition-colors", periodStatus ? "bg-emerald-500 border-transparent" : "border-slate-500")}>
                            {periodStatus && <CheckCircle size={18} className="text-white" />}
                        </div>
                        <span className="font-bold text-lg">BU AY HEPSİ ÖDENDİ</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
                    {/* Sol: Diğer Kategoriler Özeti (Placeholder yerine Gerçek Veri) */}
                    <div className="lg:col-span-1 glass-panel p-6 rounded-2xl overflow-auto space-y-4">
                        <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">Diğer Giderler</h3>
                        {otherCategories.map(cat => (
                            <div key={cat.id} className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                                <span className={cn("text-sm font-medium", cat.color)}>{cat.label}</span>
                                <span className="text-white font-mono text-sm">
                                    {(categoryTotals[cat.id] || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                </span>
                            </div>
                        ))}

                        <div className="mt-8 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <div className="text-sm text-emerald-400 mb-1">Toplam Gider</div>
                            <div className="text-2xl font-bold text-white">{grossTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
                            <div className="text-xs text-slate-500 mt-1">* Tüm kategoriler dahil</div>
                        </div>
                    </div>

                    {/* Sağ: Ekstra Giderler Listesi (Su vb.) */}
                    <div className="lg:col-span-2 glass-panel p-1 rounded-2xl flex flex-col relative">
                        <div className="p-4 flex justify-between items-center border-b border-white/5">
                            <h3 className="font-bold">Ekstra Giderler (Su, Market vb.)</h3>
                            <button onClick={() => setShowModal(true)} className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm hover:bg-emerald-500/30 transition-colors">+ Ekle</button>
                        </div>

                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left">
                                <thead className="text-xs text-slate-400 uppercase bg-white/5 sticky top-0">
                                    <tr>
                                        <th className="p-3 w-10 text-center">Sil</th>
                                        <th className="p-3">Açıklama</th>
                                        <th className="p-3 text-right">Tutar</th>
                                        <th className="p-3 text-center">Durum</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {expenses.map(item => (
                                        <tr key={item.id} className="hover:bg-white/5">
                                            <td className="p-3 text-center">
                                                <button onClick={() => handleDelete(item.id!)} className="text-slate-500 hover:text-red-400"><Trash2 size={16} /></button>
                                            </td>
                                            <td className="p-3">{item.title}</td>
                                            <td className="p-3 text-right font-mono">{item.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                            <td className="p-3 text-center">
                                                <button onClick={() => handleTogglePaid(item.id!, item.is_paid)} className={cn("text-xs px-2 py-0.5 rounded cursor-pointer select-none ring-1 active:scale-95 transition-all", item.is_paid ? "text-emerald-400 bg-emerald-500/10 ring-emerald-500/50" : "text-red-400 bg-red-500/10 ring-red-500/50")}>
                                                    {item.is_paid ? 'Ödendi' : 'Ödenmedi'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95">
                            <h3 className="text-xl font-bold mb-4 text-white">Ekstra Gider Ekle</h3>
                            <form onSubmit={handleModalSubmit} className="space-y-4">
                                <div>
                                    <label className="text-sm text-slate-400 block mb-1">Gider Adı (Örn: Su Faturası)</label>
                                    <input required autoFocus className="w-full glass-input p-3 rounded-lg" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                </div>

                                <div>
                                    <label className="text-sm text-slate-400 block mb-1">Tutar (TL)</label>
                                    <input required type="number" step="0.01" className="w-full glass-input p-3 rounded-lg font-mono" value={formData.amount || ''} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} />
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 cursor-pointer" onClick={() => setFormData({ ...formData, is_paid: !formData.is_paid })}>
                                    <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-colors", formData.is_paid ? "bg-accent border-accent" : "border-slate-500")}>
                                        {formData.is_paid && <CheckCircle size={14} className="text-white" />}
                                    </div>
                                    <span className="text-sm select-none">Bu gider ödendi olarak işaretlensin</span>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-lg glass-button text-slate-400">İptal</button>
                                    <button type="submit" className="flex-1 py-3 rounded-lg bg-accent text-white font-bold hover:bg-accent-hover">Ekle</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- Expense List View (Generic for Elektrik, Su, etc) ---
    return (
        <div className="w-full mx-auto h-full flex flex-col animate-in slide-in-from-right-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('categories')} className="p-2 rounded-lg glass-button"><ArrowLeft /></button>
                    <div>
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            {selectedCategory}
                        </h2>
                        <span className="text-sm text-slate-500">{MONTHS[selectedMonth!]} {year}</span>
                    </div>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-bold hover:bg-accent-hover shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                    <Plus size={20} />
                    Veri Ekle
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-auto glass-panel rounded-2xl p-1 relative">
                {loading && <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-10"><Loader2 className="animate-spin text-accent" size={40} /></div>}

                {expenses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <p>Henüz kayıt yok.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="text-xs text-slate-400 uppercase bg-white/5 sticky top-0 backdrop-blur-md">
                            <tr>
                                <th className="p-4 w-16 text-center">Sil</th>
                                <th className="p-4">Başlık / İsim</th>
                                {selectedCategory !== 'BAĞKUR' && <th className="p-4">Abone No</th>}
                                <th className="p-4 text-right">Tutar</th>
                                <th className="p-4 text-center">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {expenses.map(item => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-center">
                                        <button onClick={() => handleDelete(item.id!)} className="text-slate-500 hover:text-red-400 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                    <td className="p-4 font-medium">{item.title}</td>
                                    {selectedCategory !== 'BAĞKUR' && <td className="p-4 font-mono text-slate-400 text-sm">{item.number}</td>}
                                    <td className="p-4 text-right font-mono text-lg">{item.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => handleTogglePaid(item.id!, item.is_paid)}
                                            className={cn(
                                                "px-3 py-1 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer select-none",
                                                item.is_paid ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 ring-1 ring-emerald-500/50" : "bg-red-500/20 text-red-400 hover:bg-red-500/30 ring-1 ring-red-500/50"
                                            )}
                                        >
                                            {item.is_paid ? 'ÖDENDİ' : 'ÖDENMEDİ'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Footer Total */}
            <div className="mt-4 glass-panel p-4 rounded-xl flex justify-between items-center shrink-0">
                <span className="text-slate-400 font-medium">TOPLAM TUTAR</span>
                <span className="text-3xl font-black font-mono text-white tracking-tight">{currentViewTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95">
                        <h3 className="text-xl font-bold mb-4 text-white">Yeni Gider Ekle</h3>
                        <form onSubmit={handleModalSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-400 block mb-1">
                                    {selectedCategory === 'BAĞKUR' ? 'Çalışan İsmi' : 'Abone İsmi / Açıklama'}
                                </label>
                                <input required autoFocus className="w-full glass-input p-3 rounded-lg" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>

                            {selectedCategory !== 'BAĞKUR' && (
                                <div>
                                    <label className="text-sm text-slate-400 block mb-1">Abone Numarası</label>
                                    <input className="w-full glass-input p-3 rounded-lg" value={formData.number || ''} onChange={e => setFormData({ ...formData, number: e.target.value })} />
                                </div>
                            )}

                            <div>
                                <label className="text-sm text-slate-400 block mb-1">Tutar (TL)</label>
                                <input required type="number" step="0.01" className="w-full glass-input p-3 rounded-lg font-mono" value={formData.amount || ''} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} />
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 cursor-pointer" onClick={() => setFormData({ ...formData, is_paid: !formData.is_paid })}>
                                <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-colors", formData.is_paid ? "bg-accent border-accent" : "border-slate-500")}>
                                    {formData.is_paid && <CheckCircle size={14} className="text-white" />}
                                </div>
                                <span className="text-sm select-none">Bu gider ödendi olarak işaretlensin</span>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-lg glass-button text-slate-400">İptal</button>
                                <button type="submit" className="flex-1 py-3 rounded-lg bg-accent text-white font-bold hover:bg-accent-hover">Ekle</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
