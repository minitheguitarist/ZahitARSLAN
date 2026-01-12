use std::fs;
use tauri::{AppHandle, Manager, Runtime};

/// Veritabanı dosyasının asıl konumu
const DB_NAME: &str = "market.db";

/// Başlangıçta çalışacak yedekleme fonksiyonu
pub fn init<R: Runtime>(app: &AppHandle<R>) -> Result<(), Box<dyn std::error::Error>> {
    let app_data_dir = app.path().app_data_dir()?;
    let db_path = app_data_dir.join(DB_NAME);

    // Eğer veritabanı dosyası henüz yoksa yedek almaya gerek yok
    if !db_path.exists() {
        return Ok(());
    }

    let backups_dir = app_data_dir.join("backups");
    if !backups_dir.exists() {
        fs::create_dir_all(&backups_dir)?;
    }

    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    let backup_filename = format!("market_{}.db", today);
    let backup_path = backups_dir.join(backup_filename);

    // Bugün için zaten yedek alınmamışsa al
    if !backup_path.exists() {
        fs::copy(&db_path, &backup_path)?;
        println!("Yedek alındı: {:?}", backup_path);
    }

    Ok(())
}

/// Yedekten geri yükleme komutu
#[tauri::command]
pub async fn restore_backup(app: AppHandle, file_path: String) -> Result<(), String> {
    let app_data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_data_dir.join(DB_NAME);
    let target_db_wal = app_data_dir.join("market.db-wal");
    let target_db_shm = app_data_dir.join("market.db-shm");

    // 1. Mevcut veritabanını .old olarak sakla (güvenlik)
    if db_path.exists() {
        let old_path = db_path.with_extension("db.old");
        let _ = fs::rename(&db_path, &old_path);
    }
    
    // WAL dosyalarını temizle (varsa)
    let _ = fs::remove_file(target_db_wal);
    let _ = fs::remove_file(target_db_shm);

    // 2. Yeni yedeği kopyala
    match fs::copy(&file_path, &db_path) {
        Ok(_) => {
            // Veritabanı değiştiği için uygulamayı yeniden başlatmak en temizi
            app.restart();
            #[allow(unreachable_code)]
            Ok(())
        },
        Err(e) => Err(format!("Yedek geri yüklenirken hata oluştu: {}", e))
    }
}

/// Manuel yedekleme komutu
#[tauri::command]
pub async fn create_manual_backup(app: AppHandle) -> Result<String, String> {
    let app_data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_data_dir.join(DB_NAME);

    if !db_path.exists() {
        return Err("Veritabanı bulunamadı.".to_string());
    }

    let manual_backups_dir = app_data_dir.join("manualbackups");
    if !manual_backups_dir.exists() {
        fs::create_dir_all(&manual_backups_dir).map_err(|e| e.to_string())?;
    }

    let now = chrono::Local::now().format("%Y-%m-%d-%H-%M-%S").to_string();
    let backup_filename = format!("manuel-{}.db", now);
    let backup_path = manual_backups_dir.join(&backup_filename);

    fs::copy(&db_path, &backup_path).map_err(|e| format!("Kopyalama hatası: {}", e))?;

    Ok(format!("Yedek başarıyla alındı: {}", backup_filename))
}
