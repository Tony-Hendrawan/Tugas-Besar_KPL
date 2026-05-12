-- Password: password123 (bcrypt hash)

-- 1. Users
INSERT INTO users (id, nama, email, password, no_telepon) VALUES
  (1, 'Ahmad Fauzi', 'ahmad@example.com', '$2a$10$XBn.2evfm06COnIUlNGlL.yxWAJdHKyC55S.Ds2yrm4kQvb3a6pty', '081234567890'),
  (2, 'Dewi Lestari', 'dewi@example.com', '$2a$10$XBn.2evfm06COnIUlNGlL.yxWAJdHKyC55S.Ds2yrm4kQvb3a6pty', '081234567891'),
  (3, 'Budi Santoso', 'budi@example.com', '$2a$10$XBn.2evfm06COnIUlNGlL.yxWAJdHKyC55S.Ds2yrm4kQvb3a6pty', '081234567892'),
  (4, 'Siti Rahayu', 'siti@example.com', '$2a$10$XBn.2evfm06COnIUlNGlL.yxWAJdHKyC55S.Ds2yrm4kQvb3a6pty', '081234567893');
SELECT setval('users_id_seq', 4);

-- 2. Kos
INSERT INTO kos (kos_id, nama_kos, deskripsi, alamat, kota, kontak, status) VALUES
  (1, 'Kos Melati Indah', 'Kos nyaman di pusat kota Bandung dengan akses mudah ke kampus.', 'Jl. Melati No. 10', 'Bandung', '081111222333', 'tersedia'),
  (2, 'Kos Sejahtera', 'Kos premium di Jakarta Selatan dekat stasiun MRT.', 'Jl. Sejahtera No. 5', 'Jakarta Selatan', '081222333444', 'tersedia'),
  (3, 'Kos Nyaman Jaya', 'Kos sederhana dan bersih di Yogyakarta.', 'Jl. Malioboro No. 20', 'Yogyakarta', '081333444555', 'tersedia'),
  (4, 'Kos Bintang Lima', 'Kos mewah di Surabaya dengan fasilitas lengkap.', 'Jl. Darmo No. 15', 'Surabaya', '081444555666', 'tersedia'),
  (5, 'Kos Mawar Putih', 'Kos suasana rumah di Bandung, cocok untuk mahasiswa.', 'Jl. Mawar No. 8', 'Bandung', '081555666777', 'penuh');
SELECT setval('kos_kos_id_seq', 5);

-- 3. Kamar_Kos
INSERT INTO kamar_kos (kamar_id, kos_id, luas_kamar, tersedia, foto, harga_sewa) VALUES
  (1, 1, '3x4', 'ya', 'images/gambar-kos-1.jpg', 800000),
  (2, 1, '3x3', 'ya', 'images/gambar-kos-1.jpg', 650000),
  (3, 2, '4x4', 'ya', 'images/gambar-kos-2.jpg', 1500000),
  (4, 2, '3x4', 'tidak', 'images/gambar-kos-2.jpg', 1200000),
  (5, 3, '3x3', 'ya', 'images/gambar-kos-3.jpg', 600000),
  (6, 3, '3x4', 'ya', 'images/gambar-kos-3.jpg', 750000),
  (7, 4, '4x5', 'ya', 'images/gambar-kos-4.jpg', 1200000),
  (8, 4, '4x4', 'ya', 'images/gambar-kos-4.jpg', 1000000),
  (9, 5, '3x4', 'tidak', 'images/gambar-kos-5.jpg', 950000),
  (10, 5, '3x3', 'tidak', 'images/gambar-kos-5.jpg', 800000);
SELECT setval('kamar_kos_kamar_id_seq', 10);

-- 4. Fasilitas (1 fasilitas per kamar, FK kamar_id)
INSERT INTO fasilitas (fasilitas_id, kamar_id, meja, lemari, kamar_mandi_dalam, ac) VALUES
  (1, 1, 'ya', 'ya', 'ya', 'tidak'),
  (2, 2, 'ya', 'ya', 'ya', 'tidak'),
  (3, 3, 'ya', 'ya', 'ya', 'ya'),
  (4, 4, 'ya', 'ya', 'ya', 'ya'),
  (5, 5, 'ya', 'ya', 'tidak', 'tidak'),
  (6, 6, 'ya', 'ya', 'tidak', 'tidak'),
  (7, 7, 'ya', 'ya', 'ya', 'ya'),
  (8, 8, 'ya', 'ya', 'ya', 'ya'),
  (9, 9, 'ya', 'tidak', 'ya', 'ya'),
  (10, 10, 'ya', 'tidak', 'ya', 'ya');
SELECT setval('fasilitas_fasilitas_id_seq', 10);

-- 5. Pemesanan
INSERT INTO pemesanan (pemesanan_id, user_id, kos_id, tanggal_masuk, durasi_bulan, total_harga, status) VALUES
  (1, 1, 1, '2024-08-01', 6, 4800000, 'confirmed'),
  (2, 1, 2, '2024-09-01', 3, 4500000, 'pending'),
  (3, 2, 3, '2024-08-15', 12, 7200000, 'confirmed'),
  (4, 2, 4, '2024-09-10', 1, 1200000, 'cancelled'),
  (5, 3, 5, '2024-10-01', 6, 5700000, 'completed');
SELECT setval('pemesanan_pemesanan_id_seq', 5);

-- 6. Pembayaran
INSERT INTO pembayaran (pembayaran_id, pemesanan_id, jumlah, metode, status) VALUES
  (1, 1, 4800000, 'transfer', 'paid'),
  (2, 2, 4500000, 'ewallet', 'pending'),
  (3, 3, 7200000, 'transfer', 'paid'),
  (4, 4, 1200000, 'cash', 'failed'),
  (5, 5, 5700000, 'ewallet', 'paid');
SELECT setval('pembayaran_pembayaran_id_seq', 5);

-- 7. Ulasan
INSERT INTO ulasan (ulasan_id, user_id, kos_id, pemesanan_id, rating, komentar) VALUES
  (1, 1, 1, 1, 4, 'Kos nyaman, lokasi strategis. Recommended!'),
  (2, 2, 3, 3, 5, 'Sangat bersih dan pemilik ramah.'),
  (3, 3, 5, 5, 4, 'Fasilitas oke, harga terjangkau.');
SELECT setval('ulasan_ulasan_id_seq', 3);

-- 8. Riwayat
INSERT INTO riwayat (riwayat_id, user_id, kos_id, pembayaran_id, pemesanan_id) VALUES
  (1, 1, 1, 1, 1),
  (2, 2, 3, 3, 3),
  (3, 3, 5, 5, 5);
SELECT setval('riwayat_riwayat_id_seq', 3);
