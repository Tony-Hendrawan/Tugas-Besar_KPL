// @ts-nocheck


/**
 * frontend/js/compare.ts
 * TEKNIK: Table-driven Construction — compare page logic
 */

var comparePageEl = document.getElementById('comparePage');
if (comparePageEl) {
  var selectedEl = document.getElementById('compareSelected');
  var tableWrapEl = document.getElementById('compareTableWrap');
  var noticeEl = document.getElementById('compareNotice');
  var scoreEl = document.getElementById('decisionScore');

  // === Estimasi Biaya Hidup ===
  var estimationForm = document.getElementById('estimationForm');
  if (estimationForm) {
    estimationForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      var budget = Number(document.getElementById('budgetInput').value);
      if (!budget || budget <= 0) { alert('Masukkan budget yang valid'); return; }
      var res = await getRequest('/api/estimation?price=' + budget);
      var resultEl = document.getElementById('estimationResult');
      if (!res.success) { resultEl.innerHTML = '<p style="color:var(--danger);">' + res.message + '</p>'; resultEl.style.display = 'block'; return; }
      var d = res.data;
      resultEl.innerHTML =
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1rem;padding:1rem;background:var(--gray-50);border-radius:8px;">' +
          '<div><div style="font-size:0.8rem;color:var(--gray-500);">Harga Kos</div><div style="font-weight:600;">Rp ' + formatCurrency(d.kosPrice) + '</div></div>' +
          '<div><div style="font-size:0.8rem;color:var(--gray-500);">Listrik</div><div style="font-weight:600;">Rp ' + formatCurrency(d.listrik) + '</div></div>' +
          '<div><div style="font-size:0.8rem;color:var(--gray-500);">Air</div><div style="font-weight:600;">Rp ' + formatCurrency(d.air) + '</div></div>' +
          '<div><div style="font-size:0.8rem;color:var(--gray-500);">Internet</div><div style="font-weight:600;">Rp ' + formatCurrency(d.internet) + '</div></div>' +
          '<div style="border-top:2px solid var(--primary);padding-top:0.5rem;"><div style="font-size:0.8rem;color:var(--primary);font-weight:600;">TOTAL / BULAN</div><div style="font-size:1.25rem;font-weight:700;color:var(--primary);">Rp ' + formatCurrency(d.total) + '</div></div>' +
        '</div>';
      resultEl.style.display = 'block';
    });
  }

  function renderSelected() {
    var list = getCompareList();
    if (!selectedEl) return;
    if (list.length === 0) {
      selectedEl.innerHTML = '<p style="color:var(--gray-500);text-align:center;">Belum ada kos dipilih.</p>';
      return;
    }
    selectedEl.innerHTML = list.map(function(k) {
      return '<div class="compare-selected__item">' +
        '<span class="compare-selected__name">' + sanitizeInput(k.name) + '</span>' +
        '<button class="compare-selected__remove" data-id="' + k.id + '" aria-label="Hapus">✕</button>' +
      '</div>';
    }).join('');

    selectedEl.querySelectorAll('[data-id]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        removeFromCompare(Number(this.dataset.id));
        renderSelected();
        loadCompare();
      });
    });
  }

  async function loadCompare() {
    var list = getCompareList();
    if (list.length < 2) {
      if (tableWrapEl) tableWrapEl.innerHTML = '';
      if (scoreEl) scoreEl.innerHTML = '';
      if (noticeEl) noticeEl.style.display = 'block';
      return;
    }
    if (noticeEl) noticeEl.style.display = 'none';
    if (tableWrapEl) tableWrapEl.innerHTML = '<p style="text-align:center;color:var(--gray-500);padding:2rem;">Memuat perbandingan...</p>';

    var res = await postRequest('/api/compare', { kosIds: list.map(function(k) { return k.id; }) });
    if (!res.success) { if (tableWrapEl) tableWrapEl.innerHTML = '<p style="color:var(--danger);text-align:center;">Data belum ditemukan</p>'; return; }

    var compareData = res.data.compareData;
    var scores = res.data.scores;
    var items = compareData.items;
    var rows = compareData.rows;

    if (!items || !items.length) { if (tableWrapEl) tableWrapEl.innerHTML = '<p style="text-align:center;color:var(--gray-500);">Tidak ada data.</p>'; return; }

    var headers = items.map(function(kos) { return '<th style="text-align:center;">' + sanitizeInput(kos.nama_kos) + '</th>'; }).join('');
    // bagian table-driven construction: buat baris tabel berdasarkan data yang diberikan
    var tableRows = rows.map(function(row) { 
      var cells = row.values.map(function(val) { return '<td style="text-align:center;">' + sanitizeInput(String(val)) + '</td>'; }).join('');
      return '<tr><th>' + sanitizeInput(row.field ? row.field.label : row.label) + '</th>' + cells + '</tr>';
    }).join('');

    if (tableWrapEl) {
      tableWrapEl.innerHTML = '<div class="compare-table"><table>' +
        '<thead><tr><th>Kriteria</th>' + headers + '</tr></thead>' +
        '<tbody>' + tableRows + '</tbody>' +
      '</table></div>';
    }

    if (scoreEl && scores && scores.length) {
      var sorted = scores.slice().sort(function(a, b) { return b.score - a.score; });
      scoreEl.innerHTML = '<div class="decision-score"><h3>Rekomendasi Terbaik</h3><div style="margin-top:1rem;">' +
        sorted.map(function(s, i) {
          return '<div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem;margin-bottom:0.5rem;background:' + (i === 0 ? '#f0fdf4' : 'var(--gray-50)') + ';border-radius:8px;border:1px solid ' + (i === 0 ? '#86efac' : 'var(--gray-200)') + ';">' +
            '<span style="font-weight:600;">#' + (i + 1) + ' ' + sanitizeInput(s.name) + '</span>' +
            '<span style="font-weight:700;color:' + (i === 0 ? '#059669' : 'var(--gray-700)') + ';">' + s.score.toFixed(1) + ' poin</span>' +
          '</div>';
        }).join('') +
      '</div></div>';
    } else if (scoreEl) { scoreEl.innerHTML = ''; }
  }

  var btnClearAll = document.getElementById('btnClearAll');
  if (btnClearAll) btnClearAll.addEventListener('click', function() {
    if (!confirm('Hapus semua dari daftar perbandingan?')) return;
    saveCompareList([]);
    renderSelected();
    loadCompare();
  });

  renderSelected();
  loadCompare();
}