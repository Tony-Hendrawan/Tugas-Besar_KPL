// @ts-nocheck
/**
 * frontend/js/kos.ts
 * TEKNIK: Code Reuse — kos list, detail, compare selection
 */

function getKosPrice(kos) {
  // harga_min from the query or from kamar_kos
  if (kos.harga_min) return Number(kos.harga_min);
  if (kos.kamar_kos && kos.kamar_kos.length > 0) {
    return Math.min.apply(
      null,
      kos.kamar_kos.map(function (k) {
        return k.harga_sewa;
      }),
    );
  }
  return 0;
}

function renderKosCard(kos) {
  var img = getKosImagePath(kos);
  var price = getKosPrice(kos);
  var rating = Number(kos.avg_rating || 0).toFixed(1);

  return (
    '<div class="kos-card">' +
    '<div class="kos-image">' +
    '<img src="' +
    img +
    '" alt="' +
    sanitizeInput(kos.nama_kos) +
    '">' +
    '<div class="kos-badge">' +
    sanitizeInput(kos.kota) +
    "</div>" +
    '<div class="kos-rating"><span class="star">★</span> ' +
    rating +
    "</div>" +
    "</div>" +
    '<div class="kos-content">' +
    '<h3 class="kos-title">' +
    sanitizeInput(kos.nama_kos) +
    "</h3>" +
    '<p class="kos-location">📍 ' +
    sanitizeInput(kos.kota) +
    "</p>" +
    '<div class="kos-price">Rp ' +
    formatCurrency(price) +
    "</div>" +
    '<div class="kos-price-label">/ bulan</div>' +
    '<div class="kos-status" style="margin-top:0.5rem;font-size:0.8rem;color:' +
    (kos.status === "tersedia" ? "green" : "red") +
    ';">' +
    (kos.status === "tersedia" ? "✓ Tersedia" : "✕ Penuh") +
    "</div>" +
    '<div class="kos-actions"><a href="kos-detail.html?id=' +
    kos.kos_id +
    '" class="btn-detail">Lihat Detail</a></div>' +
    '<div style="margin-top:0.75rem;"><button class="btn-outline" style="width:100%;padding:0.625rem;font-size:0.875rem;" data-compare-id="' +
    kos.kos_id +
    '" data-compare-name="' +
    sanitizeInput(kos.nama_kos) +
    '">+ Bandingkan</button></div>' +
    "</div></div>"
  );
}

// Card untuk index.html (Booking + Lihat Detail)
function renderKosCardHome(kos) {
  var img = getKosImagePath(kos);
  var price = getKosPrice(kos);
  var rating = Number(kos.avg_rating || 0).toFixed(1);

  return (
    '<div class="kos-card">' +
    '<div class="kos-image">' +
    '<img src="' +
    img +
    '" alt="' +
    sanitizeInput(kos.nama_kos) +
    '">' +
    '<div class="kos-badge">' +
    sanitizeInput(kos.kota) +
    "</div>" +
    '<div class="kos-rating"><span class="star">★</span> ' +
    rating +
    "</div>" +
    "</div>" +
    '<div class="kos-content">' +
    '<h3 class="kos-title">' +
    sanitizeInput(kos.nama_kos) +
    "</h3>" +
    '<p class="kos-location">📍 ' +
    sanitizeInput(kos.kota) +
    "</p>" +
    '<div class="kos-price">Rp ' +
    formatCurrency(price) +
    "</div>" +
    '<div class="kos-price-label">/ bulan</div>' +
    '<div class="kos-status" style="margin-top:0.5rem;font-size:0.8rem;color:' +
    (kos.status === "tersedia" ? "green" : "red") +
    ';">' +
    (kos.status === "tersedia" ? "✓ Tersedia" : "✕ Penuh") +
    "</div>" +
    '<div class="kos-actions"><a href="booking.html?id=' +
    kos.kos_id +
    "&name=" +
    encodeURIComponent(kos.nama_kos) +
    '" class="btn-detail">Booking</a></div>' +
    '<div style="margin-top:0.75rem;"><a href="kos-detail.html?id=' +
    kos.kos_id +
    '" class="btn-outline" style="display:block;width:100%;padding:0.625rem;font-size:0.875rem;text-align:center;">Lihat Detail</a></div>' +
    "</div></div>"
  );
}

function updateCompareBar() {
  var bar = document.getElementById("compareBar");
  if (!bar) return;
  var list = getCompareList();
  bar.style.display = list.length === 0 ? "none" : "block";
  var text = document.getElementById("compareBarText");
  if (text) text.textContent = list.length + " kos dipilih untuk dibandingkan";
}

// === Kos List Page ===
var kosListEl = document.getElementById("kosList");
if (kosListEl) {
  var filterForm = document.getElementById("filterForm");
  var emptyState = document.getElementById("emptyState");

  async function loadKosList() {
    var params = new URLSearchParams();
    if (filterForm) {
      var loc = document.getElementById("location")
        ? document.getElementById("location").value.trim()
        : "";
      var price = document.getElementById("maxPrice")
        ? document.getElementById("maxPrice").value.trim()
        : "";
      if (loc) params.set("location", loc);
      if (price) params.set("maxPrice", price);
    }

    kosListEl.innerHTML =
      '<p style="grid-column:1/-1;text-align:center;color:var(--gray-500);">Memuat...</p>';
    var res = await getRequest("/api/kos?" + params);

    if (!res.success) {
      kosListEl.innerHTML =
        '<p style="grid-column:1/-1;text-align:center;color:var(--danger);">Data belum ditemukan</p>';
      return;
    }

    var list = res.data || [];
    if (list.length === 0) {
      kosListEl.innerHTML = "";
      if (emptyState) emptyState.style.display = "block";
      return;
    }
    if (emptyState) emptyState.style.display = "none";

    kosListEl.innerHTML = list.map(renderKosCard).join("");

    kosListEl.querySelectorAll("[data-compare-id]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var result = addToCompare({
          id: Number(this.dataset.compareId),
          name: this.dataset.compareName || "",
        });
        if (!result.ok) alert(result.msg);
        updateCompareBar();
      });
    });
  }

  loadKosList();
  if (filterForm) {
    filterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      loadKosList();
    });
    filterForm.addEventListener("reset", function () {
      setTimeout(loadKosList, 0);
    });
  }
  updateCompareBar();

  var btnGo = document.getElementById("btnGoCompare");
  if (btnGo)
    btnGo.addEventListener("click", function () {
      window.location.href = "compare.html";
    });
  var btnClear = document.getElementById("btnClearCompare");
  if (btnClear)
    btnClear.addEventListener("click", function () {
      saveCompareList([]);
      updateCompareBar();
    });
}

// === Featured Kos (index.html) ===
var featuredEl = document.getElementById("featuredKosList");
if (featuredEl && !kosListEl) {
  (async function () {
    var res = await getRequest("/api/kos");
    if (!res.success || !res.data || !res.data.length) {
      featuredEl.innerHTML =
        '<p style="grid-column:1/-1;text-align:center;color:var(--gray-500);">Data belum ditemukan</p>';
      return;
    }
    featuredEl.innerHTML = res.data.slice(0, 6).map(renderKosCardHome).join("");
  })();
}

// === Rekomendasi Kos (index.html) ===
var recommendEl = document.getElementById("recommendationList");
if (recommendEl) {
  (async function () {
    var res = await getRequest("/api/recommendation?budget=1500000");
    if (!res.success || !res.data || !res.data.length) {
      recommendEl.innerHTML =
        '<p style="grid-column:1/-1;text-align:center;color:var(--gray-500);">Belum ada rekomendasi</p>';
      return;
    }
    recommendEl.innerHTML = res.data
      .slice(0, 3)
      .map(renderKosCardHome)
      .join("");
  })();
}

// === Kos Detail Page ===
var kosDetailEl = document.getElementById("kosDetail");
if (kosDetailEl) {
  var id = getQueryParam("id");
  if (!id) {
    kosDetailEl.innerHTML =
      '<p style="text-align:center;color:var(--danger);">ID kos tidak ditemukan.</p>';
  } else {
    (async function () {
      var res = await getRequest("/api/kos/" + id);
      if (!res.success) {
        kosDetailEl.innerHTML =
          '<p style="text-align:center;color:var(--danger);">Data belum ditemukan</p>';
        return;
      }
      var kos = res.data;
      var img = getKosImagePath(kos);
      var price = getKosPrice(kos);
      var rating = Number(kos.avg_rating || 0).toFixed(1);

      // Build fasilitas from kamar_kos
      var fasilitasHtml = "";
      if (kos.kamar_kos && kos.kamar_kos.length > 0) {
        var f = kos.kamar_kos[0];
        var tags = [];
        if (f.ac === "ya") tags.push("AC");
        if (f.meja === "ya") tags.push("Meja");
        if (f.lemari === "ya") tags.push("Lemari");
        if (f.kamar_mandi_dalam === "ya") tags.push("KM Dalam");
        fasilitasHtml = tags
          .map(function (t) {
            return '<span class="facility-tag">' + t + "</span>";
          })
          .join("");
      }

      // Build kamar list
      var kamarHtml = "";
      if (kos.kamar_kos && kos.kamar_kos.length > 0) {
        kamarHtml =
          '<h3 style="font-size:1.25rem;font-weight:600;margin-bottom:1rem;">Kamar Tersedia</h3>' +
          '<div style="display:grid;gap:1rem;margin-bottom:2rem;">' +
          kos.kamar_kos
            .map(function (km) {
              return (
                '<div style="padding:1rem;border:1px solid var(--gray-200);border-radius:8px;display:flex;justify-content:space-between;align-items:center;">' +
                "<div><strong>Luas: " +
                sanitizeInput(km.luas_kamar || "-") +
                "</strong>" +
                '<span style="margin-left:1rem;color:' +
                (km.tersedia === "ya" ? "green" : "red") +
                ';">' +
                (km.tersedia === "ya" ? "✓ Tersedia" : "✕ Tidak Tersedia") +
                "</span></div>" +
                '<div style="font-weight:700;">Rp ' +
                formatCurrency(km.harga_sewa) +
                "/bln</div>" +
                "</div>"
              );
            })
            .join("") +
          "</div>";
      }

      // Build ulasan
      var ulasanHtml = "";
      if (kos.ulasan && kos.ulasan.length > 0) {
        ulasanHtml =
          '<h3 style="font-size:1.25rem;font-weight:600;margin-bottom:1rem;">Ulasan</h3>' +
          '<div style="display:grid;gap:1rem;margin-bottom:2rem;">' +
          kos.ulasan
            .map(function (u) {
              return (
                '<div style="padding:1rem;border:1px solid var(--gray-200);border-radius:8px;">' +
                '<div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;"><strong>' +
                sanitizeInput(u.user_nama) +
                "</strong><span>★ " +
                u.rating +
                "/5</span></div>" +
                '<p style="color:var(--gray-700);">' +
                sanitizeInput(u.komentar || "") +
                "</p>" +
                "</div>"
              );
            })
            .join("") +
          "</div>";
      }

      kosDetailEl.innerHTML =
        '<div style="background:var(--white);border:1px solid var(--gray-200);border-radius:12px;overflow:hidden;">' +
        '<div style="width:100%;height:400px;overflow:hidden;"><img src="' +
        img +
        '" alt="' +
        sanitizeInput(kos.nama_kos) +
        '" style="width:100%;height:100%;object-fit:cover;"></div>' +
        '<div style="padding:2rem;">' +
        '<h1 style="font-size:2rem;font-weight:700;margin-bottom:1rem;">' +
        sanitizeInput(kos.nama_kos) +
        "</h1>" +
        '<p style="color:var(--gray-600);margin-bottom:1rem;">📍 ' +
        sanitizeInput(kos.alamat || "") +
        ", " +
        sanitizeInput(kos.kota) +
        " · ★ " +
        rating +
        "</p>" +
        '<div style="font-size:2rem;font-weight:700;margin-bottom:0.25rem;">Rp ' +
        formatCurrency(price) +
        "</div>" +
        '<div style="font-size:0.875rem;color:var(--gray-500);margin-bottom:1.5rem;">/ bulan (mulai dari)</div>' +
        '<p style="color:var(--gray-700);line-height:1.7;margin-bottom:2rem;">' +
        sanitizeInput(kos.deskripsi || "Tidak ada deskripsi.") +
        "</p>" +
        '<p style="margin-bottom:2rem;"><strong>Kontak:</strong> ' +
        sanitizeInput(kos.kontak || "-") +
        "</p>" +
        '<h3 style="font-size:1.25rem;font-weight:600;margin-bottom:1rem;">Fasilitas</h3>' +
        '<div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:2rem;">' +
        (fasilitasHtml ||
          '<span style="color:var(--gray-500);">Tidak ada fasilitas</span>') +
        "</div>" +
        kamarHtml +
        ulasanHtml +
        '<div style="display:flex;gap:1rem;flex-wrap:wrap;">' +
        '<a href="booking.html?id=' +
        kos.kos_id +
        "&name=" +
        encodeURIComponent(kos.nama_kos) +
        '" class="btn-primary" style="flex:1;text-align:center;padding:0.875rem;">Booking Sekarang</a>' +
        '<button class="btn-outline" style="flex:1;padding:0.875rem;" id="btnAddCompare">+ Bandingkan</button>' +
        '<button class="btn-outline" style="flex:1;padding:0.875rem;color:var(--danger);border-color:var(--danger);" id="btnAddWishlist">♡ Wishlist</button>' +
        "</div>" +
        "</div>" +
        "</div>";

      var btnAdd = document.getElementById("btnAddCompare");
      if (btnAdd)
        btnAdd.addEventListener("click", function () {
          var result = addToCompare({ id: kos.kos_id, name: kos.nama_kos });
          alert(result.ok ? "Ditambahkan ke daftar bandingkan!" : result.msg);
        });

      var btnWishlist = document.getElementById("btnAddWishlist");
      if (btnWishlist)
        btnWishlist.addEventListener("click", async function () {
          if (!isLoggedIn()) {
            alert("Silakan login terlebih dahulu.");
            window.location.href = "login.html";
            return;
          }
          var res = await postRequest("/api/wishlist", { kos_id: kos.kos_id });
          if (res.success) {
            alert("Berhasil ditambahkan ke wishlist!");
            btnWishlist.textContent = "♥ Tersimpan";
            btnWishlist.disabled = true;
          } else alert(res.message);
        });
    })();
  }
}
