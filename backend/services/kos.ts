/**
 * backend/services/kos.ts
 * TEKNIK: Table-driven (compare), Defensive Programming
 */

import * as repo from '../repository'; // Reuse repository untuk akses data kos.
import { buildCompareTable, calculateScores } from '../compareTable'; //Reuse kode dari compareTable.ts.

export async function getAllKos(filters: { kota?: string; maxPrice?: number }) {
  const kosList = await repo.findAllKos(filters);
  return { success: true, data: kosList, message: 'Daftar kos berhasil diambil' };
}

export async function getKosDetail(id: number) {
  const kos = await repo.findKosById(id);
  if (!kos) return { success: false, message: 'Kos tidak ditemukan' };
  return { success: true, data: kos, message: 'Detail kos berhasil diambil' };
}

export async function compareKos(kosIds: number[]) {
  if (!kosIds || kosIds.length < 2 || kosIds.length > 3) {
    return { success: false, message: 'Hanya bisa membandingkan 2-3 kos' };
  }
  const kosList = await Promise.all(kosIds.map(id => repo.findKosById(id)));
  const valid = kosList.filter(k => k !== null);
  if (valid.length !== kosIds.length) return { success: false, message: 'Beberapa kos tidak ditemukan' };

  const compareData = buildCompareTable(valid); // Reuse fungsi untuk membangun data tabel perbandingan.
  const scores = calculateScores(valid); // Reuse fungsi untuk menghitung skor dari daftar kos yang dibandingkan.
  return { success: true, data: { compareData, scores }, message: 'Perbandingan berhasil' };
}