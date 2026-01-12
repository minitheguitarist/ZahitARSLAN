# Zahit ARSLAN - Cari & Gider Takip Sistemi

**Zahit ARSLAN**, modern teknolojilerle geliştirilmiş, yüksek performanslı ve kullanıcı dostu bir cari ve gider takip uygulamasıdır. İşletmenizin günlük finansal akışını, kasa hareketlerini ve giderlerini kolayca yönetmenizi sağlar.

![App Screenshot](https://raw.githubusercontent.com/minitheguitarist/ZahitARSLAN/main/screenshot.png) *(Temsili görsel)*

## 🚀 Özellikler

*   **Cari Yönetimi**:
    *   **Ana Kasa & PC Bölümleri**: İşletmenin farklı gelir kaynaklarını (Ana Kasa ve Bilgisayar) ayrı ayrı takip edin.
    *   **Nakit & Visa Ayrımı**: Ödeme yöntemlerine göre detaylı gelir takibi.
    *   **Otomatik Hesaplama**: Günlük toplamları ve kasa farklarını (Açık/Fazla) anlık olarak hesaplar.
    *   **Günlük Kayıt**: Geçmişe dönük kayıtları takvim üzerinden kolayca görüntüleyin ve düzenleyin.

*   **Gider Takibi**:
    *   **Kategorik Giderler**: Elektrik, İnternet, Bağkur, Doğal Gaz gibi sabit giderleri kategorize edin.
    *   **Periyodik Kontrol**: Aylık ödemelerin yapılıp yapılmadığını takip edin (Ödendi/Ödenmedi durumu).
    *   **Market Özeti**: Market harcamalarını ve ekstra giderleri detaylı bir şekilde raporlayın.

*   **Modern Arayüz**:
    *   **Glassmorphism Tasarım**: Şık, modern ve göz yormayan, derinlik hissi veren kullanıcı arayüzü.
    *   **Animasyonlar**: Akıcı geçişler ve etkileşimli öğelerle zenginleştirilmiş deneyim.
    *   **Tam Ekran**: Uygulama odaklanmayı artırmak için varsayılan olarak tam ekran başlar.

*   **Güvenlik & Yedekleme**:
    *   **Otomatik Yedekleme**: Uygulama her açılışta `backups` klasörüne otomatik yedek alır.
    *   **Manuel Yedekleme**: Ayarlar menüsünden istediğiniz an `manualbackups` klasörüne anlık yedek alabilirsiniz.
    *   **Kolay Geri Yükleme**: Herhangi bir yedek dosyasını (.db) seçerek verilerinizi saniyeler içinde geri yükleyebilirsiniz.

## 🛠️ Teknolojiler

Bu proje, performans ve güvenlik odaklı en güncel teknolojiler kullanılarak geliştirilmiştir:

*   **[Tauri](https://tauri.app/)**: Uygulamanın çekirdeği. Rust tabanlı bu framework, uygulamanın inanılmaz derecede hafif ve hızlı olmasını sağlar.
*   **[Rust](https://www.rust-lang.org/)**: Backend tarafında veritabanı işlemleri, dosya yönetimi ve hesaplamalar için kullanıldı. Güvenlik ve performans garantisi sunar.
*   **[React](https://reactjs.org/)**: Kullanıcı arayüzü (Frontend) için dünyanın en popüler kütüphanesi.
*   **[TypeScript](https://width="100%"ww.typescriptlang.org/)**: Tip güvenliği sağlayarak kodun daha sağlam ve hatasız olmasını sağlar.
*   **[Tailwind CSS](https://tailwindcss.com/)**: Özelleştirilebilir ve hızlı arayüz tasarımı için kullanıldı.
*   **[SQLite](https://www.sqlite.org/)**: Verilerin yerel olarak güvenli ve hızlı bir şekilde saklanması için kullanılan veritabanı.

## 💻 Kurulum ve Geliştirme

Projeyi yerel makinenizde çalıştırmak için:

1.  **Gereksinimler**:
    *   [Node.js](https://nodejs.org/)
    *   [Rust](https://rustup.rs/)

2.  **Depoyu Klonlayın**:
    ```bash
    git clone https://github.com/minitheguitarist/ZahitARSLAN.git
    cd ZahitARSLAN
    ```

3.  **Bağımlılıkları Yükleyin**:
    ```bash
    npm install
    ```

4.  **Geliştirme Modunda Çalıştırın**:
    ```bash
    npm run tauri dev
    ```

5.  **Derleme (Build)**:
    ```bash
    npm run tauri build
    ```

## 📜 Lisans

Bu proje MIT lisansı ile lisanslanmıştır.
