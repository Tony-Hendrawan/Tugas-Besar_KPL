/**
 * backend/services/recommendation.ts
 * TEKNIK: Table-driven + Defensive Programming
 * Rekomendasi kos berdasarkan preferensi user (budget, kota)
 */

import * as repo from '../repository';

// Fungsi ini memfilter dan memberi skor, meskipun tidak ada tabel konfigurasi eksplisit selain logika scoring.
// Defensive programming: pastikan input valid, dan tangani kasus tidak ada kos yang cocok dengan jelas.
export async function getRecommendations(preferences: { budget?: number; location?: string; facilities?: string[] }) {
  // Ambil semua kos yang sesuai budget dan kota
  const kosList = await repo.findAllKos({
    kota: preferences.location,
    maxPrice: preferences.budget,
  });

  // Defensive programming: jika tidak ada kos yang ditemukan, kembalikan pesan yang jelas.
  // reuse pola scoring bergantung pada data kos 
  if (!kosList || kosList.length === 0) {
    return { success: true, data: [], message: 'Tidak ada kos yang sesuai preferensi' };
  }

  // Skor berdasarkan rating + harga (murah = bagus)
  const maxPrice = Math.max(...kosList.map((k: any) => Number(k.harga_min) || 0));

  const scored = kosList.map((kos: any) => {
    const ratingScore = (Number(kos.avg_rating) || 0) / 5;
    const priceScore = maxPrice > 0 ? ((maxPrice - (Number(kos.harga_min) || 0)) / maxPrice) : 0;
    const score = (ratingScore * 50) + (priceScore * 50);
    return { ...kos, score };
  });

  // Urutkan dari skor tertinggi
  scored.sort((a: any, b: any) => b.score - a.score);

  return { success: true, data: scored.slice(0, 5), message: 'Rekomendasi berhasil' };
}
