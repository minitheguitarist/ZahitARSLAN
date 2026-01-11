import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';

interface CalendarViewProps {
    onDateSelect: (date: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onDateSelect }) => {
    const [date, setDate] = useState<Date>(new Date());

    const handleDateChange = (value: any) => {
        if (value instanceof Date) {
            setDate(value);
            onDateSelect(value);
        }
    };

    return (
        <div className="glass-panel p-6 rounded-2xl w-full max-w-4xl mx-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    Tarih Seçimi
                </h2>
                <div className="text-sm text-slate-400">
                    Bugün: <span className="text-accent font-medium">{new Date().toLocaleDateString('tr-TR')}</span>
                </div>
            </div>

            <Calendar
                onChange={handleDateChange}
                value={date}
                locale="tr-TR"
                minDate={new Date(2026, 0, 1)} // 1 Ocak 2026'dan öncesi kapalı
                prevLabel={<ChevronLeft className="w-5 h-5" />}
                nextLabel={<ChevronRight className="w-5 h-5" />}
                prev2Label={null}
                next2Label={null}
                className="w-full bg-transparent border-none font-sans"
                tileClassName={({ date: d, view }) => {
                    // Haftasonu renklendirmesi vb. yapılabilir
                    if (view === 'month' && (d.getDay() === 0 || d.getDay() === 6)) {
                        return 'text-red-300';
                    }
                    return null;
                }}
            />
        </div>
    );
};
