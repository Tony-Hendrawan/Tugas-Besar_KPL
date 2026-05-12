/**
 * backend/services/estimation.ts
 * TEKNIK: Table-driven — estimasi biaya hidup berdasarkan tabel konfigurasi
 */

// Tabel biaya tambahan bulanan (bisa diubah tanpa ubah logika)
const MONTHLY_COSTS = { // Ini adalah bagian utama table-driven configuration untuk estimasi biaya hidup bulanan.
  listrik: 150000,
  air: 75000,
  internet: 100000,
};

export interface EstimationResult {
  kosPrice: number;
  listrik: number;
  air: number;
  internet: number;
  total: number;
}

// reuse fungsi dari MONTHLY_COSTS untuk menghitung total estimasi biaya hidup bulanan berdasarkan harga kos.
export function calculateEstimation(kosPrice: number): EstimationResult {
  const total = kosPrice + MONTHLY_COSTS.listrik + MONTHLY_COSTS.air + MONTHLY_COSTS.internet;
  return {
    kosPrice,
    listrik: MONTHLY_COSTS.listrik,
    air: MONTHLY_COSTS.air,
    internet: MONTHLY_COSTS.internet,
    total,
  };
}