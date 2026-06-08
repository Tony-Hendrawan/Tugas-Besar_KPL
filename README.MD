# GoletKos

Temukan Kos Terbaik tanpa Ribet

<p align="center">
  <img src="./assets/logo.png" alt="GoletKos Logo" />
</p>

---

## Deskripsi

GoletKos adalah platform aplikasi berbasis web yang membantu pengguna dalam mencari kos berdasarkan berbagai kriteria seperti lokasi, harga, dan fasilitas. Selain itu, GoletKos dilengkapi dengan fitur perbandingan kos yang memungkinkan pengguna membandingkan beberapa pilihan secara langsung, sehingga mempermudah dalam menentukan kos terbaik secara lebih efektif.

Aplikasi ini dirancang tidak hanya sebagai alat pencarian, tetapi juga sebagai sistem pendukung keputusan sederhana yang membantu pengguna dalam memilih kos yang paling sesuai dengan kebutuhan mereka.

---

## Role Pengguna

### Pencari Kos (User)

Pengguna yang mencari dan membandingkan kos.

Fitur:

* Registrasi dan login
* Pencarian kos berdasarkan lokasi, harga, dan fasilitas
* Melihat detail kos (foto, fasilitas, harga, deskripsi)
* Menyimpan kos (wishlist) — harus login terlebih dahulu
* Membandingkan beberapa kos (compare)
* Mendapatkan rekomendasi kos
* Melihat estimasi biaya hidup
* Melakukan booking
* Melihat riwayat booking

---



## Fitur Utama

### Perbandingan Kos (Compare)

* Memilih beberapa kos sekaligus
* Menampilkan perbandingan dalam bentuk tabel
* Membandingkan harga, fasilitas, lokasi, dan rating
* Menampilkan perbedaan utama antar kos

---

### Decision Score

* Memberikan skor pada setiap kos berdasarkan:

  * Harga
  * Fasilitas
  * Lokasi
  * Rating

* Menyediakan rekomendasi kos terbaik

---

### Estimasi Biaya Hidup

* Menghitung estimasi biaya per bulan yang meliputi:

  * Harga kos
  * Listrik
  * Air
  * Internet

* Menyajikan total estimasi pengeluaran

---

### Rekomendasi Kos

* Memberikan rekomendasi berdasarkan preferensi pengguna:

  * Budget
  * Fasilitas
  * Lokasi

---

### Wishlist

* Menyimpan kos favorit (harus login)
* Melihat daftar kos yang disimpan
* Menghapus kos dari wishlist

---

### Status Booking

* Mengatur alur status booking:

  * Pending → Dikonfirmasi → Selesai
  * Pending → Dibatalkan

---

## Tech Stack

* Frontend: HTML, CSS, TypeScript
* Backend: TypeScript, Node.js (Express.js)
* Database: PostgreSQL (Supabase)
* Tools: GitHub, Postman

---

## Struktur Data

### Entitas:

* User
* Kos
* Kamar_Kos
* Fasilitas
* Pemesanan
* Pembayaran
* Ulasan
* Riwayat
* Wishlist

### Relasi:

* User dapat melakukan pemesanan kos (1:N)
* User dapat menyimpan kos ke wishlist (1:N)
* User dapat memberikan ulasan pada kos (1:N)
* Kos memiliki banyak kamar (1:N)
* Setiap kamar memiliki fasilitas (1:1)
* Pemesanan memiliki satu pembayaran (1:1)
* Pemesanan dapat memiliki satu ulasan (1:1)
* Riwayat mencatat pemesanan yang telah selesai

### Diagram ERD

Detail visualisasi hubungan antar entitas database dapat dilihat pada diagram ERD berikut:

![Diagram ERD Database](./assets/erd-diagram-database.jpeg)

---

## Teknik Konstruksi Perangkat Lunak

Setiap anggota tim menerapkan dua teknik konstruksi perangkat lunak sesuai dengan ketentuan tugas.

### Pembagian Teknik per Anggota

| Nama   | Teknik 1                    | Teknik 2              |
| ------ | --------------------------- | --------------------- |
| Davis  | API                         | Runtime Configuration |
| Daffa  | Table-driven Construction   | Code Reuse / Library  |
| Tony   | Parameterization / Generics | Code Reuse / Library  |
| Rafael | Automata                    | Runtime Configuration |

---

### Implementasi Teknik

#### API

Digunakan untuk komunikasi antara frontend dan backend, seperti endpoint:

* GET /api/kos
* GET /api/kos/:id
* POST /api/auth/login
* POST /api/auth/register
* POST /api/booking
* POST /api/compare

---

#### Runtime Configuration

Digunakan untuk pengaturan sistem yang dapat diubah tanpa mengubah kode, seperti konfigurasi port server, koneksi database, dan JWT secret melalui environment variables.

---

#### Code Reuse / Library

Digunakan untuk meningkatkan efisiensi pengembangan melalui penggunaan ulang kode, seperti helper function (sendSuccess, sendError, validateRequired, formatCurrency, sanitizeInput), middleware (authenticate), serta pemanfaatan library seperti Express.js dan bcryptjs.


---

#### Table-driven Construction

Digunakan dalam pengolahan data berbasis tabel atau mapping. Kolom perbandingan kos didefinisikan sebagai array konfigurasi (COMPARE_FIELDS), sehingga untuk menambah kolom baru cukup tambah satu entry tanpa mengubah logika.


---

#### Automata

Digunakan untuk mengatur alur status pemesanan secara terstruktur menggunakan Finite State Machine (FSM). Transisi yang valid: Pending → Confirmed → Completed, Pending → Cancelled. Transisi yang tidak valid akan ditolak.

---

#### Parameterization / Generics

Digunakan untuk membuat fungsi yang bersifat fleksibel dan reusable dengan TypeScript Generics, seperti query<T>() untuk database query dan sendSuccess<T>() untuk response, sehingga bisa dipakai untuk tipe data apapun.

---

## Testing

### API Testing (Postman)

Collection Postman tersedia di `docs/GoletKos.postman_collection.json`.

Endpoint yang ditest:
* Auth: Register, Login
* Kos: List, Detail, Compare
* Booking: Create, History
* Features: Estimation, Recommendation, Wishlist

---

## Tujuan Pengembangan

GoletKos dikembangkan untuk:

* Mempermudah proses pencarian kos
* Mengurangi kompleksitas dalam memilih kos
* Menyediakan fitur perbandingan yang informatif
* Mendukung pengambilan keputusan secara cepat dan tepat
* Menyediakan platform pencarian kos yang mudah digunakan

---

## Status Proyek

Dalam tahap pengembangan sebagai bagian dari Tugas Besar Konstruksi Perangkat Lunak.

---

## Tim Pengembang

* Davis : 103122400034 
* Daffa : 103122400029
* Rafael: 103122400015
* Tony  : 103122400021

---

## Lisensi

Proyek ini dikembangkan untuk kebutuhan wajib tugas mata kuliah Kontruksi Perangkat Lunak.
