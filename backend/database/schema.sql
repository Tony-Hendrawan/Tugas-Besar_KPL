DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS riwayat CASCADE;
DROP TABLE IF EXISTS ulasan CASCADE;
DROP TABLE IF EXISTS pembayaran CASCADE;
DROP TABLE IF EXISTS pemesanan CASCADE;
DROP TABLE IF EXISTS fasilitas CASCADE;
DROP TABLE IF EXISTS kamar_kos CASCADE;
DROP TABLE IF EXISTS kos CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  no_telepon VARCHAR(15)
);

-- 2. Kos
CREATE TABLE kos (
  kos_id SERIAL PRIMARY KEY,
  nama_kos VARCHAR(20) NOT NULL,
  deskripsi TEXT,
  alamat TEXT,
  kota TEXT,
  kontak VARCHAR(20),
  status VARCHAR(10) NOT NULL DEFAULT 'tersedia' CHECK (status IN ('tersedia', 'penuh'))
);

-- 3. Kamar_Kos (TIDAK ada fasilitas_id — sesuai ERD)
CREATE TABLE kamar_kos (
  kamar_id SERIAL PRIMARY KEY,
  kos_id INT NOT NULL REFERENCES kos(kos_id) ON DELETE CASCADE,
  luas_kamar VARCHAR(10),
  tersedia VARCHAR(5) NOT NULL DEFAULT 'ya' CHECK (tersedia IN ('ya', 'tidak')),
  foto VARCHAR(300),
  harga_sewa INT NOT NULL
);

-- 4. Fasilitas (punya kamar_id sebagai FK — sesuai ERD)
CREATE TABLE fasilitas (
  fasilitas_id SERIAL PRIMARY KEY,
  kamar_id INT NOT NULL REFERENCES kamar_kos(kamar_id) ON DELETE CASCADE,
  meja VARCHAR(5) NOT NULL DEFAULT 'tidak' CHECK (meja IN ('ya', 'tidak')),
  lemari VARCHAR(5) NOT NULL DEFAULT 'tidak' CHECK (lemari IN ('ya', 'tidak')),
  kamar_mandi_dalam VARCHAR(5) NOT NULL DEFAULT 'tidak' CHECK (kamar_mandi_dalam IN ('ya', 'tidak')),
  ac VARCHAR(5) NOT NULL DEFAULT 'tidak' CHECK (ac IN ('ya', 'tidak'))
);

-- 5. Pemesanan
CREATE TABLE pemesanan (
  pemesanan_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kos_id INT NOT NULL REFERENCES kos(kos_id) ON DELETE CASCADE,
  tanggal_masuk DATE NOT NULL,
  durasi_bulan INT NOT NULL DEFAULT 1,
  total_harga INT NOT NULL,
  status VARCHAR(15) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled'))
);

-- 6. Pembayaran
CREATE TABLE pembayaran (
  pembayaran_id SERIAL PRIMARY KEY,
  pemesanan_id INT NOT NULL REFERENCES pemesanan(pemesanan_id) ON DELETE CASCADE,
  jumlah INT NOT NULL,
  metode VARCHAR(10) NOT NULL CHECK (metode IN ('transfer', 'cash', 'ewallet')),
  status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed'))
);

-- 7. Ulasan
CREATE TABLE ulasan (
  ulasan_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kos_id INT NOT NULL REFERENCES kos(kos_id) ON DELETE CASCADE,
  pemesanan_id INT NOT NULL REFERENCES pemesanan(pemesanan_id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  komentar TEXT
);

-- 8. Riwayat
CREATE TABLE riwayat (
  riwayat_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kos_id INT NOT NULL REFERENCES kos(kos_id) ON DELETE CASCADE,
  pembayaran_id INT REFERENCES pembayaran(pembayaran_id) ON DELETE SET NULL,
  pemesanan_id INT NOT NULL REFERENCES pemesanan(pemesanan_id) ON DELETE CASCADE
);

-- 9. Wishlist (tambahan fitur, tidak ada di ERD asli)
CREATE TABLE wishlist (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kos_id INT NOT NULL REFERENCES kos(kos_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, kos_id)
);
