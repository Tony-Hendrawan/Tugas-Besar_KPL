CREATE TYPE status_kos_enum AS ENUM ('Aktif', 'Nonaktif', 'Penuh'); 
CREATE TYPE tersedia_kos_enum AS ENUM ('Tersedia', 'Habis');
CREATE TYPE status_pemesanan_enum AS ENUM ('Pending', 'Disetujui', 'Dibatalkan', 'Selesai');
CREATE TYPE metode_pembayaran_enum AS ENUM ('Transfer Bank', 'E-Wallet', 'Tunai');
CREATE TYPE status_pembayaran_enum AS ENUM ('Belum Bayar', 'Menunggu Verifikasi', 'Lunas', 'Gagal');


CREATE TABLE USERS (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    no_telepon VARCHAR(15)
);

CREATE TABLE KOS (
    kos_id SERIAL PRIMARY KEY,
    nama_kos VARCHAR(50) NOT NULL,
    deskripsi TEXT,
    alamat TEXT NOT NULL,        
    kota VARCHAR(50) NOT NULL,
    kontak VARCHAR(20),
    status status_kos_enum DEFAULT 'Aktif',
    luas_kamar VARCHAR(20),
    tersedia tersedia_kos_enum DEFAULT 'Tersedia',
    foto VARCHAR(500),
    harga_sewa INT NOT NULL,
    biaya_listrik INT DEFAULT 0,
    biaya_air INT DEFAULT 0,
    biaya_internet INT DEFAULT 0
);

CREATE TABLE FASILITAS (
    fasilitas_id SERIAL PRIMARY KEY,
    nama_fasilitas VARCHAR(50) NOT NULL,
    icon_fasilitas VARCHAR(255)
);

CREATE TABLE WISHLIST (
    user_id INT,
    kos_id INT,
    PRIMARY KEY (user_id, kos_id),
    FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
    FOREIGN KEY (kos_id) REFERENCES KOS(kos_id) ON DELETE CASCADE
);

CREATE TABLE FASILITAS_MILIK (
    fasilitas_id INT,
    kos_id INT,
    PRIMARY KEY (fasilitas_id, kos_id),
    FOREIGN KEY (fasilitas_id) REFERENCES FASILITAS(fasilitas_id) ON DELETE CASCADE,
    FOREIGN KEY (kos_id) REFERENCES KOS(kos_id) ON DELETE CASCADE
);

CREATE TABLE PEMESANAN (
    pemesanan_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    kos_id INT NOT NULL,
    tanggal_masuk DATE NOT NULL,
    durasi_bulan INT NOT NULL,
    total_harga INT NOT NULL,
    status status_pemesanan_enum DEFAULT 'Pending',
    FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE RESTRICT,
    FOREIGN KEY (kos_id) REFERENCES KOS(kos_id) ON DELETE RESTRICT
);

CREATE TABLE PEMBAYARAN (
    pembayaran_id SERIAL PRIMARY KEY,
    pemesanan_id INT NOT NULL,
    jumlah INT NOT NULL,
    metode metode_pembayaran_enum NOT NULL,
    status status_pembayaran_enum DEFAULT 'Belum Bayar',
    tanggal_pembayaran TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (pemesanan_id) REFERENCES PEMESANAN(pemesanan_id) ON DELETE CASCADE
);

CREATE TABLE ULASAN (
    ulasan_id SERIAL PRIMARY KEY,
    pemesanan_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    komentar TEXT,
    FOREIGN KEY (pemesanan_id) REFERENCES PEMESANAN(pemesanan_id) ON DELETE CASCADE
);