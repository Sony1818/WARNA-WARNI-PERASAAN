# 🌈 Warna-Warni Perasaan

Game edukasi mengenal 5 emosi (Senang, Sedih, Marah, Takut, Bangga) untuk anak
dengan kebutuhan khusus (autisme & tunagrahita). Dibuat dengan HTML, CSS, dan
JavaScript murni — tanpa framework — sehingga bisa langsung di-hosting di
**GitHub Pages**.

## 🎵 Musik latar & alur layar

Setiap layar terpisah dan berjalan berurutan secara otomatis:

**Halaman Utama → Isi Nama → Video Materi → Level 1–5 → Hasil → Sertifikat**

Setiap layar memutar **file musik MP3-nya sendiri**. Taruh file-file berikut
di folder `assets/musik/` dengan nama **persis** seperti ini:

| Layar / Level        | Nama file             |
|------------------------|------------------------|
| Halaman Utama          | `sambutan.mp3`         |
| Isi Nama                | `nama.mp3`              |
| Video Materi            | `materi.mp3`            |
| Level Senang            | `senang.mp3`            |
| Level Sedih             | `sedih.mp3`             |
| Level Marah             | `marah.mp3`             |
| Level Takut             | `takut.mp3`             |
| Level Bangga            | `bangga.mp3`            |
| Layar Hasil              | `hasil.mp3`             |
| Layar Sertifikat         | `sertifikat.mp3`        |

Catatan:
- Musik akan otomatis **memudar (fade out/in)** saat berpindah layar, dan
  **berulang (loop)** selama anak masih berada di layar itu.
- Jika file untuk suatu layar belum ada, aplikasi tetap berjalan normal
  tanpa musik di layar tersebut (tidak akan error atau macet).
- Karena aturan browser, musik baru bisa mulai diputar setelah anak
  **menekan tombol pertama kali** (tombol "Mulai" di halaman utama). Setelah
  itu, perpindahan musik antar layar berikutnya berjalan otomatis.
- Ada tombol 🔊 di pojok kiri atas setiap layar untuk mematikan/menyalakan
  musik kapan saja — preferensi ini disimpan di Local Storage.
- Setiap layar juga punya hiasan latar (bentuk mengambang seperti bintang,
  balon, awan) agar tampilan lebih ceria. Hiasan dibuat lebih redup di layar
  video/materi & permainan supaya anak tetap fokus.

## ✅ Sudah bisa langsung dicoba

Aplikasi ini **tetap bisa dimainkan meskipun video belum ditambahkan**.
Jika video suatu level belum ada, aplikasi otomatis menampilkan cerita
singkat pengganti (mode cadangan) supaya alur permainan tetap lengkap.

## 📁 Struktur folder

```
warna-warni-perasaan/
├── index.html          → seluruh halaman (beranda, permainan, hasil, sertifikat)
├── css/
│   └── style.css        → semua gaya visual & responsif
├── js/
│   └── app.js            → seluruh logika permainan
└── assets/
    ├── videos/            → taruh video MP4 di sini (lihat di bawah)
    ├── musik/              → taruh musik latar MP3 di sini (lihat di atas)
    └── gambar/
        └── logo-sekolah.png → logo yang tampil di halaman utama
```

## 🎬 Menambahkan video sungguhan

Taruh 5 file video di folder `assets/videos/` dengan nama **persis** seperti ini:

| Level  | Nama file        |
|--------|------------------|
| Senang | `senang.mp4`     |
| Sedih  | `sedih.mp4`      |
| Marah  | `marah.mp4`      |
| Takut  | `takut.mp4`      |
| Bangga | `bangga.mp4`     |

Selain itu, ada **1 video materi pengantar** yang tampil sekali di awal,
sebelum anak masuk ke Level 1 — taruh di `assets/videos/materi.mp4`.
Anak **wajib menonton video ini sampai selesai** (tidak bisa lompat maju)
sebelum tombol "Mulai Bermain" muncul.

Setelah video ditambahkan, atur **detik video akan berhenti otomatis**
(sebelum pertanyaan muncul) di file `js/app.js`, cari bagian `LEVELS` di
bagian paling atas, lalu ubah angka `stopTime` (dalam detik) sesuai video:

```js
{
  id: "senang",
  label: "Senang",
  emoji: "😄",
  video: "assets/videos/senang.mp4",
  stopTime: 4,   // ← ganti angka ini sesuai detik yang diinginkan
  ...
}
```

## 🚀 Cara publish ke GitHub Pages

1. Buat repository baru di GitHub, misalnya `warna-warni-perasaan`.
2. Upload seluruh isi folder ini (jangan folder pembungkusnya, isinya saja)
   ke repository tersebut.
3. Buka menu **Settings → Pages** pada repository.
4. Pada bagian **Branch**, pilih `main` dan folder `/ (root)`, lalu **Save**.
5. Tunggu 1–2 menit, situs akan aktif di alamat:
   `https://<nama-akun-github>.github.io/warna-warni-perasaan/`

## 🧒 Pertimbangan aksesibilitas untuk anak berkebutuhan khusus

- Urutan pilihan jawaban **selalu sama** di setiap level (tidak diacak) agar
  anak merasa lebih nyaman dan bisa memprediksi tampilan.
- Video baru diputar setelah anak menekan tombol "Tonton Video" sendiri
  (tidak auto-play tiba-tiba) agar tidak mengejutkan.
- Tombol berukuran besar untuk memudahkan anak dengan kesulitan motorik.
- Warna cerah namun tidak berkedip/menyilaukan.
- Pesan "coba lagi" bersifat mendukung, bukan menghukum — anak boleh
  mencoba menjawab berkali-kali sampai benar.
- Mendukung pengaturan "reduced motion" pada perangkat.

## 💾 Local Storage yang digunakan

| Kunci               | Isi                                          |
|----------------------|-----------------------------------------------|
| `wwp_skorTerbaik`    | Skor tertinggi yang pernah dicapai            |
| `wwp_riwayat`        | Riwayat 50 permainan terakhir (nama, skor, tanggal) |
| `wwp_namaTerakhir`   | Nama pemain terakhir (untuk memudahkan main lagi) |

## 🔊 Tentang suara tepuk tangan

Suara tepuk tangan **dibuat langsung lewat kode** (Web Audio API), jadi
tidak perlu menambahkan file suara terpisah — otomatis berfungsi begitu
situs dibuka.
