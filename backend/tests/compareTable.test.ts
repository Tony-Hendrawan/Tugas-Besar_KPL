import { buildCompareTable, calculateScores } from '../compareTable';

describe('Compare Table - Table-driven and Decision Scoring Tests', () => {

  const mockKosList = [
    {
      kos_id: 1,
      nama_kos: 'Kos A',
      kota: 'Bandung',
      avg_rating: 4.5,
      kamar_kos: [
        { harga_sewa: 1000000, tersedia: 'ya', ac: 'ya', meja: 'ya', lemari: 'ya', kamar_mandi_dalam: 'ya' }
      ]
    },
    {
      kos_id: 2,
      nama_kos: 'Kos B',
      kota: 'Jakarta',
      avg_rating: 4.0,
      kamar_kos: [
        { harga_sewa: 1500000, tersedia: 'ya', ac: 'ya', meja: 'tidak', lemari: 'ya', kamar_mandi_dalam: 'tidak' }
      ]
    }
  ];

  describe('buildCompareTable()', () => {
    it('should correctly build comparative table structure', () => {
      const result = buildCompareTable(mockKosList);
      expect(result.fields.length).toBeGreaterThan(0);
      expect(result.rows.length).toBeGreaterThan(0);

      // Check first row (Nama Kos)
      const nameRow = result.rows.find(row => row.field.key === 'nama_kos');
      expect(nameRow).toBeDefined();
      expect(nameRow?.values).toEqual(['Kos A', 'Kos B']);

      // Check Rating formatting
      const ratingRow = result.rows.find(row => row.field.key === 'avg_rating');
      expect(ratingRow?.values).toEqual(['4.5 / 5', '4.0 / 5']);
    });
  });

  describe('calculateScores()', () => {
    it('should compute scores based on rating, price, and facilities', () => {
      const scores = calculateScores(mockKosList);
      expect(scores.length).toBe(2);

      // Kos A has cheaper price (1M vs 1.5M), better rating (4.5 vs 4.0), and more facilities (4 vs 2)
      // So Kos A should have a higher score than Kos B
      const scoreA = scores.find(s => s.id === 1)?.score || 0;
      const scoreB = scores.find(s => s.id === 2)?.score || 0;
      expect(scoreA).toBeGreaterThan(scoreB);
    });
  });
});
