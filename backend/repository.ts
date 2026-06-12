/**
 * Generics - repository pattern untuk akses database
 * Satu file untuk semua query database.
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
    const rows = await query('SELECT *, user_id as id FROM users WHERE email = $1 LIMIT 1', [email]);
    return rows[0] ?? null;
}

export async function createUser(nama: string, email: string, hashedPassword: string, no_telepon?: string) {
    const rows = await query(
        'INSERT INTO users (nama, email, password, no_telepon) VALUES ($1, $2, $3, $4) RETURNING user_id as id, nama, email, no_telepon',
        [nama, email, hashedPassword, no_telepon || null]
    );
    return rows[0];
}

//KOS repository

export async function findAllKos(filters: { kota?: string; maxPrice?: number } = {}) {
    let sql = `
    SELECT k.*,
      k.harga_sewa as harga_min,
      k.harga_sewa as harga_max,
      (SELECT COALESCE(AVG(u.rating), 0) FROM ulasan u JOIN pemesanan p ON p.pemesanan_id = u.pemesanan_id WHERE p.kos_id = k.kos_id) as avg_rating
    FROM kos k`;
    const params: any[] = [];
    const conditions: string[] = [];

    if (filters.kota) { params.push(`%${filters.kota}%`); conditions.push(`k.kota ILIKE $${params.length}`); }
    if (filters.maxPrice) {
        params.push(filters.maxPrice);
        conditions.push(`k.harga_sewa <= $${params.length}`);
    }

    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY k.kos_id';
    return query(sql, params);
}

export async function findKosById(id: number) {
    const rows = await query(
        `SELECT k.*,
      (SELECT COALESCE(AVG(u.rating), 0) FROM ulasan u JOIN pemesanan p ON p.pemesanan_id = u.pemesanan_id WHERE p.kos_id = k.kos_id) as avg_rating
     FROM kos k WHERE k.kos_id = $1`,
        [id]
    );
    if (!rows[0]) return null;

    const kos = rows[0];

    //Get fasilitas
    const fasRows = await query(
        `SELECT f.nama_fasilitas
     FROM fasilitas f JOIN fasilitas_milik fm ON fm.fasilitas_id = f.fasilitas_id
     WHERE fm.kos_id = $1`,
        [id]
    );
    
    // Simulate kamar_kos for frontend compatibility
    kos.kamar_kos = [{
        kamar_id: kos.kos_id,
        kos_id: kos.kos_id,
        luas_kamar: kos.luas_kamar,
        tersedia: kos.tersedia,
        harga_sewa: kos.harga_sewa,
        ac: fasRows.some((f: any) => f.nama_fasilitas.toLowerCase().includes('ac')) ? 'ya' : 'tidak',
        meja: fasRows.some((f: any) => f.nama_fasilitas.toLowerCase().includes('meja')) ? 'ya' : 'tidak',
        lemari: fasRows.some((f: any) => f.nama_fasilitas.toLowerCase().includes('lemari')) ? 'ya' : 'tidak',
        kamar_mandi_dalam: fasRows.some((f: any) => f.nama_fasilitas.toLowerCase().includes('kamar mandi dalam')) ? 'ya' : 'tidak',
    }];

    //Get ulasan
    const ulasanRows = await query(
        `SELECT ul.*, us.nama as user_nama 
         FROM ulasan ul 
         JOIN pemesanan p ON p.pemesanan_id = ul.pemesanan_id
         JOIN users us ON us.user_id = p.user_id 
         WHERE p.kos_id = $1 ORDER BY ul.ulasan_id DESC`,
        [id]
    );
    kos.ulasan = ulasanRows;

    return kos;
}

//Kamar Kos Repository

export async function findKamarByKosId(kosId: number) {
    const rows = await query(`SELECT * FROM kos WHERE kos_id = $1`, [kosId]);
    if (!rows[0]) return [];
    const kos = rows[0];
    const fasRows = await query(
        `SELECT f.nama_fasilitas
     FROM fasilitas f JOIN fasilitas_milik fm ON fm.fasilitas_id = f.fasilitas_id
     WHERE fm.kos_id = $1`,
        [kosId]
    );
    return [{
        kamar_id: kos.kos_id,
        kos_id: kos.kos_id,
        luas_kamar: kos.luas_kamar,
        tersedia: kos.tersedia,
        harga_sewa: kos.harga_sewa,
        ac: fasRows.some((f: any) => f.nama_fasilitas.toLowerCase().includes('ac')) ? 'ya' : 'tidak',
        meja: fasRows.some((f: any) => f.nama_fasilitas.toLowerCase().includes('meja')) ? 'ya' : 'tidak',
        lemari: fasRows.some((f: any) => f.nama_fasilitas.toLowerCase().includes('lemari')) ? 'ya' : 'tidak',
        kamar_mandi_dalam: fasRows.some((f: any) => f.nama_fasilitas.toLowerCase().includes('kamar mandi dalam')) ? 'ya' : 'tidak',
    }];
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
     FROM pemesanan p JOIN kos k ON k.kos_id = p.kos_id JOIN users us ON us.user_id = p.user_id
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
        `INSERT INTO pembayaran (pemesanan_id, jumlah, metode, status, tanggal_pembayaran) VALUES ($1, $2, $3, 'pending', NOW()) RETURNING *`,
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
        `INSERT INTO ulasan (pemesanan_id, rating, komentar) VALUES ($1, $2, $3) RETURNING *`,
        [pemesananId, rating, komentar]
    );
    return rows[0];
}

export async function findUlasanByKos(kosId: number) {
    return query(
        `SELECT ul.*, us.nama as user_nama 
         FROM ulasan ul 
         JOIN pemesanan p ON p.pemesanan_id = ul.pemesanan_id
         JOIN users us ON us.user_id = p.user_id 
         WHERE p.kos_id = $1 ORDER BY ul.ulasan_id DESC`,
        [kosId]
    );
}

//Riwayat Repository

export async function createRiwayat(userId: number, kosId: number, pembayaranId: number | null, pemesananId: number) {
    return { riwayat_id: Date.now(), user_id: userId, kos_id: kosId, pembayaran_id: pembayaranId, pemesanan_id: pemesananId };
}

export async function findRiwayatByUser(userId: number) {
    return query(
        `SELECT p.pemesanan_id as riwayat_id, p.user_id, p.kos_id, pb.pembayaran_id, p.pemesanan_id,
       k.nama_kos, k.kota, p.tanggal_masuk, p.durasi_bulan, p.total_harga, p.status as pemesanan_status,
       pb.jumlah as pembayaran_jumlah, pb.metode as pembayaran_metode, pb.status as pembayaran_status
     FROM pemesanan p
     JOIN kos k ON k.kos_id = p.kos_id
     LEFT JOIN pembayaran pb ON pb.pemesanan_id = p.pemesanan_id
     WHERE p.user_id = $1 ORDER BY p.pemesanan_id DESC`,
        [userId]
    );
}

//Whishlist Repository

export async function getWishlist(userId: number) {
    return query(
        `SELECT w.user_id, w.kos_id, w.kos_id as wishlist_id, k.*,
      k.harga_sewa as harga_min,
      (SELECT COALESCE(AVG(u.rating), 0) FROM ulasan u JOIN pemesanan p ON p.pemesanan_id = u.pemesanan_id WHERE p.kos_id = k.kos_id) as avg_rating
     FROM wishlist w JOIN kos k ON k.kos_id = w.kos_id
     WHERE w.user_id = $1`,
        [userId]
    );
}

export async function addToWishlist(userId: number, kosId: number) {
    // Cek duplikat
    const existing = await query('SELECT * FROM wishlist WHERE user_id = $1 AND kos_id = $2', [userId, kosId]);
    if (existing.length > 0) return null;
    const rows = await query('INSERT INTO wishlist (user_id, kos_id) VALUES ($1, $2) RETURNING *', [userId, kosId]);
    return rows[0];
}

export async function removeFromWishlist(userId: number, kosId: number): Promise<boolean> {
    const rows = await query('DELETE FROM wishlist WHERE user_id = $1 AND kos_id = $2 RETURNING kos_id', [userId, kosId]);
    return rows.length > 0;
}

export default pool;