// @ts-nocheck
/**
 * frontend/js/wishlist.ts
 * Halaman wishlist — harus login
 */

var wishlistEl = document.getElementById('wishlistContent');
if (wishlistEl) {
    requireAuth();

    async function loadWishlist() {
        wishlistEl.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--gray-500);">Memuat...</p>';
        var res = await getRequest('/api/wishlist');
        if (!res.success) { wishlistEl.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--danger);">' + res.message + '</p>'; return; }

        var list = res.data || [];
        if (list.length === 0) {
            wishlistEl.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;"><p style="color:var(--gray-500);margin-bottom:1rem;">Belum ada kos di wishlist.</p><a href="kos-list.html" class="btn-primary">Cari Kos</a></div>';
            return;
        }

        wishlistEl.innerHTML = list.map(function (kos) {
            var img = getKosImagePath(kos);
            var price = kos.harga_min || 0;
            return '<div class="kos-card">' +
                '<div class="kos-image"><img src="' + img + '" alt="' + sanitizeInput(kos.nama_kos) + '"><div class="kos-badge">' + sanitizeInput(kos.kota) + '</div></div>' +
                '<div class="kos-content">' +
                '<h3 class="kos-title">' + sanitizeInput(kos.nama_kos) + '</h3>' +
                '<p class="kos-location">📍 ' + sanitizeInput(kos.kota) + '</p>' +
                '<div class="kos-price">Rp ' + formatCurrency(price) + '</div>' +
                '<div class="kos-price-label">/ bulan</div>' +
                '<div class="kos-actions" style="flex-direction:column;gap:0.5rem;">' +
                '<a href="kos-detail.html?id=' + kos.kos_id + '" class="btn-detail">Lihat Detail</a>' +
                '<button class="btn-outline" style="width:100%;color:var(--danger);border-color:var(--danger);" data-remove-wishlist="' + kos.kos_id + '">Hapus dari Wishlist</button>' +
                '</div>' +
                '</div></div>';
        }).join('');

        wishlistEl.querySelectorAll('[data-remove-wishlist]').forEach(function (btn) {
            btn.addEventListener('click', async function () {
                var kosId = this.dataset.removeWishlist;
                var res = await apiFetch('/api/wishlist/' + kosId, { method: 'DELETE' });
                if (res.success) loadWishlist();
                else alert(res.message);
            });
        });
    }

    loadWishlist();
}
