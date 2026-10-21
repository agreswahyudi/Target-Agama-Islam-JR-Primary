# Panduan memasang website JR Primary

## 1. Coba desain dulu
1. Ekstrak ZIP.
2. Buka `index.html` di Chrome.
3. Klik **Lihat contoh laporan**. Data contoh hanya untuk melihat desain.

## 2. Pasang di GitHub Pages
1. Masuk ke GitHub dan buat repository baru, misalnya `jr-primary-laporan-agama`.
2. Untuk percobaan desain, repository boleh publik karena paket ini tidak menyertakan data siswa asli. Jangan upload file Excel sekolah.
3. Upload `index.html`, `styles.css`, dan `app.js` ke bagian utama repository.
4. Buka **Settings → Pages**.
5. Pada bagian build/deployment pilih **Deploy from a branch**, pilih branch `main` dan folder `/ (root)`, lalu Save.
6. Tunggu sampai GitHub memberikan alamat website.

## 3. Siapkan Google Sheets untuk koneksi data
Sebelum menghubungkan, pastikan nama tab dan judul kolom konsisten:
- `SISWA`: ID Siswa (atau ID), Nama, Kelas, Status
- `TARGET SURAH`: ID Target, Nama Surah, Urutan, Aktif
- `TARGET DOA`: ID Target, Nama Doa, Urutan, Aktif
- `TARGET LAINNYA`: ID Target, Nama Target, Urutan, Aktif
- `PROGRESS`: ID Progress, ID Siswa, ID Target, Status, Tanggal Setoran
- `BACAAN AL-QURAN`: ID Catatan, ID Siswa, Jenis Bacaan, Jilid Iqra, Surah, Posisi Terakhir, Status, Tanggal Update, Catatan

**Pemeriksaan data workbook saat ini:** pada sheet `BACAAN AL-QURAN`, nilai kolom `ID Siswa` pada baris yang ada berupa nama anak, sedangkan sheet `SISWA` memakai ID seperti `S001`. Samakan kolom itu dengan ID siswa yang benar sebelum koneksi, agar laporan tidak salah atau kosong.

Akses versi ini hanya memakai nama lengkap sesuai permintaan. Nama saja bukan autentikasi: siapa pun yang mengetahui nama anak mungkin dapat melihat laporannya. Sebelum dipublikasikan, minta persetujuan sekolah dan batasi isi laporan pada informasi yang memang disetujui untuk akses ini. Backend menolak nama yang sama persis jika terdaftar lebih dari sekali. Jangan pernah membuat spreadsheet publik.

## 4. Pasang Apps Script (starter, perlu diuji)
1. Buka Google Sheets → **Extensions / Ekstensi → Apps Script**.
2. Salin isi file `Code.gs` ke editor Apps Script.
3. Ganti `PASTE_GOOGLE_SHEETS_ID_HERE` dengan ID spreadsheet. ID adalah bagian URL di antara `/d/` dan `/edit`.
4. Simpan project.
5. Sebelum dipakai orang tua, uji dengan data dummy. Deploy sebagai **Web app** hanya setelah memahami siapa yang dapat mengakses aplikasi dan data apa yang dikembalikan. Jangan mengubah sheet menjadi publik.
6. Setelah URL web app diuji dan cocok, masukkan URL itu ke konstanta `API_URL` di bagian atas `app.js`.

**Catatan teknis:** browser-to-Apps-Script requests and access settings can behave differently depending on deployment and browser policies. Test with dummy data first. If direct requests are blocked or redirect unexpectedly, use a supported proxy/backend or a sign-in approach approved by the school. Do not weaken access controls just to make the connection work.

## 5. Tambahkan logo
Saat logo tersedia, letakkan file gambar logo di repository, misalnya `logo-jr.png`, lalu ubah elemen `.brand-mark` di `index.html` menjadi:
`<img src="logo-jr.png" alt="JR Primary" class="school-logo">`
Tambahkan ke `styles.css`:
`.school-logo{width:44px;height:44px;object-fit:contain}`

## 6. Sebelum dibagikan ke orang tua
- Uji nama lengkap yang cocok, salah eja, dan nama duplikat.
- Ingat bahwa nama saja tidak membuktikan bahwa pengunjung adalah orang tua/wali siswa.
- Pastikan tidak ada endpoint yang mengembalikan semua data siswa.
- Uji melalui HP.
- Minta persetujuan pihak sekolah tentang pengelolaan dan penyimpanan data anak.
- Jangan gunakan contoh laporan sebagai laporan resmi.
