/**
 * Generics - repository pattern untuk akses database
 * Satu file untuk semua query database (users, kos, kamar_kos, pemesanan, pembayaran, ulasan, riwayat).
 */

import { Pool } from 'pg';
import config from './config';

const pool = config.db.available
    ? new Pool({
        connectionString: config.db.url,
        ssl: { rejectUnauthorized: false },
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    })
    : null;

//Generic query helper
async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!pool) {
        throw new Error('Database belum dikonfigurasi (DATABASE_URL kosong)');
    }
    try {
        const result = await pool.query(sql, params);
        return result.rows;
    } catch (error: any) {
        console.error('[DB Error]', error.message);
        throw error;
    }
}

//USER REPOSITORY

export async function findUserByEmail(email: string) {
    const rows = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
    return rows[0] ?? null;
}

export async function createUser(nama: string, email: string, hashedPassword: string, no_telepon?: string) {
    const rows = await query(
        'INSERT INTO users (nama, email, password, no_telepon) VALUES ($1, $2, $3, $4) RETURNING id, nama, email, no_telepon',
        [nama, email, hashedPassword, no_telepon || null]
    );
    return rows[0];
}

//KOS repository

export async function findAllKos(filters: { kota?: string; maxPrice?: number } = {}) {
    let sql = `
    SELECT k.*,
      (SELECT MIN(km.harga_sewa) FROM kamar_kos km WHERE km.kos_id = k.kos_id AND km.tersedia = 'ya') as harga_min,
      (SELECT MAX(km.harga_sewa) FROM kamar_kos km WHERE km.kos_id = k.kos_id) as harga_max,
      (SELECT COALESCE(AVG(u.rating), 0) FROM ulasan u WHERE u.kos_id = k.kos_id) as avg_rating
    FROM kos k`;
    const params: any[] = [];
    const conditions: string[] = [];

    if (filters.kota) { params.push(`%${filters.kota}%`); conditions.push(`k.kota ILIKE $${params.length}`); }
    if (filters.maxPrice) {
        params.push(filters.maxPrice);
        conditions.push(`EXISTS (SELECT 1 FROM kamar_kos km WHERE km.kos_id = k.kos_id AND km.harga_sewa <= $${params.length})`);
    }

    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY k.kos_id';
    return query(sql, params);
}

export async function findKosById(id: number) {
    const rows = await query(
        `SELECT k.*,
      (SELECT COALESCE(AVG(u.rating), 0) FROM ulasan u WHERE u.kos_id = k.kos_id) as avg_rating
     FROM kos k WHERE k.kos_id = $1`,
        [id]
    );
    if (!rows[0]) return null;

    const kos = rows[0];

    //Get kamar_kos with fasilitas
    const kamarRows = await query(
        `SELECT km.*, f.ac, f.meja, f.lemari, f.kamar_mandi_dalam
     FROM kamar_kos km LEFT JOIN fasilitas f ON f.kamar_id = km.kamar_id
     WHERE km.kos_id = $1 ORDER BY km.kamar_id`,
        [id]
    );
    kos.kamar_kos = kamarRows;

    //Get ulasan
    const ulasanRows = await query(
        `SELECT ul.*, us.nama as user_nama FROM ulasan ul JOIN users us ON us.id = ul.user_id WHERE ul.kos_id = $1 ORDER BY ul.ulasan_id DESC`,
        [id]
    );
    kos.ulasan = ulasanRows;

    return kos;
}

//Kamar Kos Repository

export async function findKamarByKosId(kosId: number) {
    return query(
        `SELECT km.*, f.ac, f.meja, f.lemari, f.kamar_mandi_dalam
     FROM kamar_kos km LEFT JOIN fasilitas f ON f.kamar_id = km.kamar_id
     WHERE km.kos_id = $1 ORDER BY km.kamar_id`,
        [kosId]
    );
}

//Pemesanan Repository

export async function createPemesanan(userId: number, kosId: number, tanggalMasuk: string, durasiBulan: number, totalHarga: number) {
    const rows = await query(
        `INSERT INTO pemesanan (user_id, kos_id, tanggal_masuk, durasi_bulan, total_harga, status)
     VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
        [userId, kosId, tanggalMasuk, durasiBulan, totalHarga]
    );
    return rows[0];
}

export async function findPemesananById(id: number) {
    const rows = await query(
        `SELECT p.*, k.nama_kos, us.nama as user_nama
     FROM pemesanan p JOIN kos k ON k.kos_id = p.kos_id JOIN users us ON us.id = p.user_id
     WHERE p.pemesanan_id = $1`,
        [id]
    );
    return rows[0] ?? null;
}

export async function findPemesananByUser(userId: number) {
    return query(
        `SELECT p.*, k.nama_kos, k.kota, k.alamat,
       pb.pembayaran_id, pb.jumlah as pembayaran_jumlah, pb.metode as pembayaran_metode, pb.status as pembayaran_status
     FROM pemesanan p
     JOIN kos k ON k.kos_id = p.kos_id
     LEFT JOIN pembayaran pb ON pb.pemesanan_id = p.pemesanan_id
     WHERE p.user_id = $1 ORDER BY p.pemesanan_id DESC`,
        [userId]
    );
}

export async function updatePemesananStatus(id: number, status: string): Promise<void> {
    await query('UPDATE pemesanan SET status = $1 WHERE pemesanan_id = $2', [status, id]);
}

//Pembayaran Repository

export async function createPembayaran(pemesananId: number, jumlah: number, metode: string) {
    const rows = await query(
        `INSERT INTO pembayaran (pemesanan_id, jumlah, metode, status) VALUES ($1, $2, $3, 'pending') RETURNING *`,
        [pemesananId, jumlah, metode]
    );
    return rows[0];
}

export async function findPembayaranByPemesanan(pemesananId: number) {
    const rows = await query('SELECT * FROM pembayaran WHERE pemesanan_id = $1', [pemesananId]);
    return rows[0] ?? null;
}

export async function updatePembayaranStatus(id: number, status: string): Promise<void> {
    await query('UPDATE pembayaran SET status = $1 WHERE pembayaran_id = $2', [status, id]);
}

//Ulasan Repository

export async function createUlasan(userId: number, kosId: number, pemesananId: number, rating: number, komentar: string) {
    const rows = await query(
        `INSERT INTO ulasan (user_id, kos_id, pemesanan_id, rating, komentar) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [userId, kosId, pemesananId, rating, komentar]
    );
    return rows[0];
}

export async function findUlasanByKos(kosId: number) {
    return query(
        `SELECT ul.*, us.nama as user_nama FROM ulasan ul JOIN users us ON us.id = ul.user_id WHERE ul.kos_id = $1 ORDER BY ul.ulasan_id DESC`,
        [kosId]
    );
}

//Riwayat Repository

export async function createRiwayat(userId: number, kosId: number, pembayaranId: number | null, pemesananId: number) {
    const rows = await query(
        `INSERT INTO riwayat (user_id, kos_id, pembayaran_id, pemesanan_id) VALUES ($1, $2, $3, $4) RETURNING *`,
        [userId, kosId, pembayaranId, pemesananId]
    );
    return rows[0];
}

export async function findRiwayatByUser(userId: number) {
    return query(
        `SELECT r.*, k.nama_kos, k.kota, p.tanggal_masuk, p.durasi_bulan, p.total_harga, p.status as pemesanan_status,
       pb.jumlah as pembayaran_jumlah, pb.metode as pembayaran_metode, pb.status as pembayaran_status
     FROM riwayat r
     JOIN kos k ON k.kos_id = r.kos_id
     JOIN pemesanan p ON p.pemesanan_id = r.pemesanan_id
     LEFT JOIN pembayaran pb ON pb.pembayaran_id = r.pembayaran_id
     WHERE r.user_id = $1 ORDER BY r.riwayat_id DESC`,
        [userId]
    );
}

//Whishlist Repository

export async function getWishlist(userId: number) {
    return query(
        `SELECT w.id as wishlist_id, w.created_at as saved_at, k.*,
      (SELECT MIN(km.harga_sewa) FROM kamar_kos km WHERE km.kos_id = k.kos_id AND km.tersedia = 'ya') as harga_min,
      (SELECT COALESCE(AVG(u.rating), 0) FROM ulasan u WHERE u.kos_id = k.kos_id) as avg_rating
     FROM wishlist w JOIN kos k ON k.kos_id = w.kos_id
     WHERE w.user_id = $1 ORDER BY w.created_at DESC`,
        [userId]
    );
}

export async function addToWishlist(userId: number, kosId: number) {
    // Cek duplikat
    const existing = await query('SELECT id FROM wishlist WHERE user_id = $1 AND kos_id = $2', [userId, kosId]);
    if (existing.length > 0) return null;
    const rows = await query('INSERT INTO wishlist (user_id, kos_id) VALUES ($1, $2) RETURNING *', [userId, kosId]);
    return rows[0];
}

export async function removeFromWishlist(userId: number, kosId: number): Promise<boolean> {
    const rows = await query('DELETE FROM wishlist WHERE user_id = $1 AND kos_id = $2 RETURNING id', [userId, kosId]);
    return rows.length > 0;
}

export default pool;