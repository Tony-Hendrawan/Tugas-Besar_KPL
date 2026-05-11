/**
 * frontend/js/utils.ts
 * TEKNIK: Code Reuse — utility functions yang dipakai di seluruh frontend
 */

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID').format(amount);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>"'`;\\]/g, '');
}

function showAlert(container, message, type) {
  if (!container) return;
  if (!type) type = 'error';
  var text = typeof message === 'string' ? message : (message && message.message) || JSON.stringify(message);
  container.innerHTML = '<div class="alert alert--' + type + '" role="alert">' + sanitizeInput(String(text)) + '</div>';
}

function clearAlert(container) {
  if (container) container.innerHTML = '';
}

function setButtonLoading(btn, loading, loadingText) {
  if (!btn) return;
  if (!loadingText) loadingText = 'Memproses...';
  if (loading) {
    btn.dataset.originalText = btn.textContent || '';
    btn.textContent = loadingText;
    btn.disabled = true;
  } else {
    btn.textContent = btn.dataset.originalText || btn.textContent;
    btn.disabled = false;
  }
}

function getDefaultKosImage(kosId) {
  var id = Number(kosId) || 1;
  var imageNum = ((id - 1) % 5) + 1;
  return 'images/gambar-kos-' + imageNum + '.jpg';
}

function getKosImagePath(kos) {
  // Try kamar_kos foto first
  if (kos && kos.kamar_kos && kos.kamar_kos.length > 0 && kos.kamar_kos[0].foto) {
    var foto = kos.kamar_kos[0].foto.trim();
    if (foto.startsWith('images/')) return foto;
    if (/^https?:\/\/.+/i.test(foto)) return foto;
  }
  // Fallback to image_url (legacy) or default
  var imageUrl = (kos && kos.image_url) ? kos.image_url.trim() : '';
  if (/^data:image\/(?:jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(imageUrl)) return imageUrl;
  if (imageUrl.startsWith('images/')) return imageUrl;
  if (/^https?:\/\/.+/i.test(imageUrl)) return imageUrl;
  return getDefaultKosImage(kos && (kos.kos_id || kos.id) ? (kos.kos_id || kos.id) : 1);
}

// Navbar toggle — dipakai di semua halaman
document.addEventListener('DOMContentLoaded', function() {
  var toggle = document.getElementById('navbarToggle');
  var menu = document.getElementById('navbarMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', function() { menu.classList.toggle('active'); });
  }
});

// === Compare List Helpers (dipakai di kos.ts dan compare.ts) ===
var COMPARE_KEY = 'compareList';
var MAX_COMPARE = 3;

function getCompareList() {
  try { return JSON.parse(localStorage.getItem(COMPARE_KEY) || '[]'); } catch (e) { return []; }
}

function saveCompareList(list) {
  localStorage.setItem(COMPARE_KEY, JSON.stringify(list));
}

function addToCompare(kos) {
  var list = getCompareList();
  if (list.find(function(k) { return k.id === kos.id; })) return { ok: false, msg: 'Kos sudah ada di daftar bandingkan.' };
  if (list.length >= MAX_COMPARE) return { ok: false, msg: 'Maksimal ' + MAX_COMPARE + ' kos.' };
  list.push(kos);
  saveCompareList(list);
  return { ok: true, msg: 'Ditambahkan!' };
}

function removeFromCompare(kosId) {
  saveCompareList(getCompareList().filter(function(k) { return k.id !== kosId; }));
}