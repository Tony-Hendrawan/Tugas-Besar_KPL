/**
 * backend/services/booking.ts
 * TEKNIK: Automata — transisi status via FSM
 * Handles pemesanan + pembayaran
 */

import * as repo from '../repository';
import { validatePemesanan } from '../utils';
import { transitionBooking, BookingStatus } from '../statusMachine';

export async function createPemesanan(userId: number, data: { kos_id: number; tanggal_masuk: string; durasi_bulan: number; metode_bayar?: string }) {
  const errors = validatePemesanan(data);
  if (errors.length > 0) return { success: false, message: errors.join(', ') };

  // Check kos exists
  const kos = await repo.findKosById(Number(data.kos_id));
  if (!kos) return { success: false, message: 'Kos tidak ditemukan' };

  // Get cheapest available kamar for total price calculation
  const kamarList = kos.kamar_kos || [];
  const availableKamar = kamarList.filter((k: any) => k.tersedia === 'ya');
  if (availableKamar.length === 0) return { success: false, message: 'Tidak ada kamar tersedia di kos ini' };

  const cheapestKamar = availableKamar.reduce((min: any, k: any) => k.harga_sewa < min.harga_sewa ? k : min, availableKamar[0]);
  const totalHarga = cheapestKamar.harga_sewa * Number(data.durasi_bulan);

  // Create pemesanan — langsung confirmed
  const pemesanan = await repo.createPemesanan(userId, Number(data.kos_id), data.tanggal_masuk, Number(data.durasi_bulan), totalHarga);

  // Update status ke confirmed
  await repo.updatePemesananStatus(pemesanan.pemesanan_id, 'confirmed');
  pemesanan.status = 'confirmed';

  // Create pembayaran — langsung paid
  const metode = data.metode_bayar || 'transfer';
  const pembayaran = await repo.createPembayaran(pemesanan.pemesanan_id, totalHarga, metode);
  await repo.updatePembayaranStatus(pembayaran.pembayaran_id, 'paid');

  return { success: true, data: { ...pemesanan, pembayaran }, message: 'Pemesanan berhasil dibuat' };
}

export async function getPemesananHistory(userId: number) {
  const pemesananList = await repo.findPemesananByUser(userId);
  return { success: true, data: pemesananList, message: 'Riwayat pemesanan berhasil diambil' };
}

export async function updatePemesananStatus(pemesananId: number, newStatus: string) {
  if (!newStatus) return { success: false, message: "Field 'status' wajib diisi" };

  const pemesanan = await repo.findPemesananById(pemesananId);
  if (!pemesanan) return { success: false, message: 'Pemesanan tidak ditemukan' };

  const result = transitionBooking(pemesanan.status as BookingStatus, newStatus as BookingStatus);
  if (!result.success) return { success: false, message: result.message };

  await repo.updatePemesananStatus(pemesananId, newStatus);

  // If confirmed, update pembayaran to paid
  if (newStatus === 'confirmed') {
    const pembayaran = await repo.findPembayaranByPemesanan(pemesananId);
    if (pembayaran) {
      await repo.updatePembayaranStatus(pembayaran.pembayaran_id, 'paid');
    }
  }

  // If completed, create riwayat
  if (newStatus === 'completed') {
    const pembayaran = await repo.findPembayaranByPemesanan(pemesananId);
    await repo.createRiwayat(pemesanan.user_id, pemesanan.kos_id, pembayaran?.pembayaran_id || null, pemesananId);
  }

  return { success: true, data: { ...pemesanan, status: newStatus }, message: result.message };
}