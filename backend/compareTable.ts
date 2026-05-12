/**
 * backend/compareTable.ts
 * TEKNIK: Table-driven Construction
 * Kolom perbandingan kos didefinisikan sebagai data (array konfigurasi).
 * Untuk menambah kolom baru, cukup tambah satu entry di COMPARE_FIELDS.
 */

export interface CompareField {
  key: string;
  label: string;
  format: (value: any, kos?: any) => string;
}

// Tabel konfigurasi — ini yang menentukan apa yang ditampilkan
const COMPARE_FIELDS: CompareField[] = [  //Ini adalah bagian utama table-driven configuration.
  { key: 'nama_kos', label: 'Nama Kos', format: (v) => v ?? '-' },
  { key: 'kota', label: 'Kota', format: (v) => v ?? '-' },
  { key: 'harga_sewa', label: 'Harga / Bulan', format: (_v, kos) => {
    const kamar = kos?.kamar_kos || [];
    if (kamar.length === 0) return '-';
    const min = Math.min(...kamar.map((k: any) => k.harga_sewa));
    const max = Math.max(...kamar.map((k: any) => k.harga_sewa));
    if (min === max) return `Rp ${Number(min).toLocaleString('id-ID')}`;
    return `Rp ${Number(min).toLocaleString('id-ID')} - ${Number(max).toLocaleString('id-ID')}`;
  }},
  { key: 'avg_rating', label: 'Rating', format: (v) => v ? `${Number(v).toFixed(1)} / 5` : '-' },
  { key: 'fasilitas', label: 'Fasilitas', format: (_v, kos) => {
    const kamar = kos?.kamar_kos || [];
    if (kamar.length === 0) return '-';
    const fasilitas: string[] = [];
    const first = kamar[0];
    if (first.ac === 'ya') fasilitas.push('AC');
    if (first.meja === 'ya') fasilitas.push('Meja');
    if (first.lemari === 'ya') fasilitas.push('Lemari');
    if (first.kamar_mandi_dalam === 'ya') fasilitas.push('KM Dalam');
    return fasilitas.length > 0 ? fasilitas.join(', ') : '-';
  }},
  { key: 'status', label: 'Status', format: (v) => v === 'tersedia' ? 'Tersedia' : 'Penuh' },
];

export interface CompareRow {
  field: { key: string; label: string };
  values: string[];
}

// Fungsi ini membangun tabel perbandingan dari COMPARE_FIELDS
// Ini adalah table-driven construction: kolom tabel dibentuk dari data konfigurasi.
export function buildCompareTable(kosList: any[]): { fields: CompareField[]; items: any[]; rows: CompareRow[] } {
  const rows: CompareRow[] = COMPARE_FIELDS.map(field => ({
    field: { key: field.key, label: field.label },
    values: kosList.map(kos => field.format(kos[field.key], kos)),
  }));
  return { fields: COMPARE_FIELDS, items: kosList, rows };
}

// Reuse logic untuk hitung skor dari daftar kos.
/** Hitung skor keputusan: rating 40%, harga 30% (murah = bagus), fasilitas 30% */
export function calculateScores(kosList: any[]): { id: number; name: string; score: number }[] {
  const prices = kosList.map(k => {
    const kamar = k.kamar_kos || [];
    if (kamar.length === 0) return 0;
    return Math.min(...kamar.map((km: any) => km.harga_sewa));
  });
  const maxPrice = Math.max(...prices);

  return kosList.map((kos, i) => {
    const ratingScore = ((Number(kos.avg_rating) || 0) / 5) * 40;
    const priceScore = maxPrice > 0 ? ((maxPrice - prices[i]) / maxPrice) * 30 : 0;
    const kamar = kos.kamar_kos || [];
    let facilityCount = 0;
    if (kamar.length > 0) {
      const f = kamar[0];
      if (f.ac === 'ya') facilityCount++;
      if (f.meja === 'ya') facilityCount++;
      if (f.lemari === 'ya') facilityCount++;
      if (f.kamar_mandi_dalam === 'ya') facilityCount++;
    }
    const facilityScore = (facilityCount / 4) * 30;
    return { id: kos.kos_id, name: kos.nama_kos, score: ratingScore + priceScore + facilityScore };
  });
}