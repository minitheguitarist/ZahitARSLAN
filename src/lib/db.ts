import Database from '@tauri-apps/plugin-sql';

const DB_NAME = 'sqlite:market.db';

export interface DailyRecord {
    date: string;
    ana_kasa_nakit: number;
    ana_kasa_visa: number;
    pc_nakit: number;
    pc_visa: number;
}

export interface Expense {
    id?: number;
    period: string; // YYYY-MM
    category: string;
    sub_category?: string; // Optional
    title: string;
    number?: string; // Optional
    amount: number;
    is_paid: boolean;
}

export interface PeriodStatus {
    period: string;
    is_fully_paid: boolean;
}

let dbInstance: Database | null = null;

async function getDb() {
    if (!dbInstance) {
        dbInstance = await Database.load(DB_NAME);
    }
    return dbInstance;
}

export async function getDailyRecord(date: string): Promise<DailyRecord | null> {
    const db = await getDb();
    const result = await db.select<DailyRecord[]>(
        'SELECT * FROM daily_records WHERE date = $1',
        [date]
    );

    if (result.length > 0) {
        return result[0];
    }
    return null;
}

export async function saveDailyRecord(record: DailyRecord): Promise<void> {
    const db = await getDb();
    // Upsert logic: SQLite doesn't have UPSERT in older versions but Tauri usually bundles a modern one.
    // We'll use INSERT OR REPLACE for simplicity
    await db.execute(
        `INSERT OR REPLACE INTO daily_records (date, ana_kasa_nakit, ana_kasa_visa, pc_nakit, pc_visa) 
     VALUES ($1, $2, $3, $4, $5)`,
        [
            record.date,
            record.ana_kasa_nakit,
            record.ana_kasa_visa,
            record.pc_nakit,
            record.pc_visa
        ]
    );
}

// --- Gider Fonksiyonları ---

export async function getExpenses(period: string, category: string): Promise<Expense[]> {
    const db = await getDb();
    const result = await db.select<any[]>(
        'SELECT * FROM expenses WHERE period = $1 AND category = $2',
        [period, category]
    );
    // Convert 1/0 to boolean
    return result.map(r => ({
        ...r,
        is_paid: Boolean(r.is_paid)
    }));
}

export async function addExpense(expense: Expense): Promise<void> {
    const db = await getDb();
    await db.execute(
        `INSERT INTO expenses (period, category, sub_category, title, number, amount, is_paid) 
    VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
            expense.period,
            expense.category,
            expense.sub_category || null,
            expense.title,
            expense.number || null,
            expense.amount,
            expense.is_paid ? 1 : 0 // Explicit cast
        ]
    );
}

export async function updateExpensePaidStatus(id: number, is_paid: boolean): Promise<void> {
    const db = await getDb();
    await db.execute('UPDATE expenses SET is_paid = $1 WHERE id = $2', [is_paid ? 1 : 0, id]);
}

export async function deleteExpense(id: number): Promise<void> {
    const db = await getDb();
    await db.execute('DELETE FROM expenses WHERE id = $1', [id]);
}

export async function getPeriodStatus(period: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.select<any[]>('SELECT * FROM period_status WHERE period = $1', [period]);
    return result.length > 0 ? Boolean(result[0].is_fully_paid) : false;
}

export async function setPeriodStatus(period: string, is_fully_paid: boolean): Promise<void> {
    const db = await getDb();
    await db.execute(
        'INSERT OR REPLACE INTO period_status (period, is_fully_paid) VALUES ($1, $2)',
        [period, is_fully_paid ? 1 : 0]
    );
}

// Market Summary helper to get totals by category for a period
export async function getCategoryTotal(period: string, category: string): Promise<number> {
    const db = await getDb();
    const result = await db.select<{ total: number }[]>(
        'SELECT SUM(amount) as total FROM expenses WHERE period = $1 AND category = $2',
        [period, category]
    );
    return result[0]?.total || 0;
}
