use tauri_plugin_sql::{Migration, MigrationKind};

pub fn get_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            kind: MigrationKind::Up,
            sql: "
                CREATE TABLE IF NOT EXISTS daily_records (
                    date TEXT PRIMARY KEY,
                    ana_kasa_nakit REAL DEFAULT 0,
                    ana_kasa_visa REAL DEFAULT 0,
                    pc_nakit REAL DEFAULT 0,
                    pc_visa REAL DEFAULT 0
                );

                CREATE TABLE IF NOT EXISTS expenses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    period TEXT NOT NULL, -- YYYY-MM
                    category TEXT NOT NULL,
                    sub_category TEXT,
                    title TEXT NOT NULL,
                    number TEXT,
                    amount REAL DEFAULT 0,
                    is_paid BOOLEAN DEFAULT 0
                );

                CREATE TABLE IF NOT EXISTS period_status (
                    period TEXT PRIMARY KEY, -- YYYY-MM
                    is_fully_paid BOOLEAN DEFAULT 0
                );
            ",
        }
    ]
}
