// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod db;
mod backup;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // Başlangıçta yedekleme kontrolü
            if let Err(e) = backup::init(app.handle()) {
                eprintln!("Yedekleme hatası: {}", e);
            }
            Ok(())
        })
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_sql::Builder::new()
                .add_migrations("sqlite:market.db", db::get_migrations())
                .build()
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, backup::restore_backup, backup::create_manual_backup])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
