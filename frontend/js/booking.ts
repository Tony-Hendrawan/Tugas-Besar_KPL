// @ts-nocheck
/**
 * frontend/js/booking.ts
 * TEKNIK: Automata — status pemesanan dikelola oleh state machine di backend
 */

// === Booking Form Page ===
var bookingFormEl = document.getElementById("bookingForm");
if (bookingFormEl) {
  requireAuth();
  var kosId = getQueryParam("id");
  var bookingAlertEl = document.getElementById("bookingAlert");
  var kosData = null;

  async function loadKosDetails() {
    if (!kosId) {
      document.getElementById("kosPreview").innerHTML =
        '<p style="color:var(--danger);text-align:center;">ID kos tidak ditemukan.</p>';
      return;
    }
    var res = await getRequest("/api/kos/" + kosId);
    if (!res.success) {
      document.getElementById("kosPreview").innerHTML =
        '<p style="color:var(--danger);">Data belum ditemukan</p>';
      return;
    }
    kosData = res.data;
    var img = getKosImagePath(kosData);
    var price = getKosPrice(kosData);
    document.getElementById("kosPreview").innerHTML =
      '<div class="kos-preview">' +
      '<div class="kos-preview-image"><img src="' +
      img +
      '" alt="' +
      sanitizeInput(kosData.nama_kos) +
      '"></div>' +
      '<div class="kos-preview-info">' +
      '<h3 class="kos-preview-name">' +
      sanitizeInput(kosData.nama_kos) +
      "</h3>" +
      '<p style="color:var(--gray-600);">📍 ' +
      sanitizeInput(kosData.kota) +
      "</p>" +
      '<div class="kos-preview-price">Rp ' +
      formatCurrency(price) +
      ' <span style="font-size:0.875rem;color:var(--gray-600);">/ bulan</span></div>' +
      "</div>" +
      "</div>";
    updateBookingSummary();
  }

  function updateBookingSummary() {
    if (!kosData) return;
    var price = getKosPrice(kosData);
    var duration = Number(document.getElementById("duration").value) || 0;
    var total = price * duration;
    document.getElementById("summaryKosName").textContent = kosData.nama_kos;
    document.getElementById("summaryLocation").textContent = kosData.kota;
    document.getElementById("summaryPrice").textContent =
      "Rp " + formatCurrency(price);
    document.getElementById("summaryDuration").textContent =
      duration > 0 ? duration + " Bulan" : "-";
    document.getElementById("summaryTotal").textContent =
      duration > 0 ? "Rp " + formatCurrency(total) : "Rp 0";

    // Estimasi biaya hidup
    var estKos = document.getElementById("estKos");
    var estTotal = document.getElementById("estTotal");
    if (estKos && estTotal) {
      estKos.textContent = "Rp " + formatCurrency(price);
      var biayaTotal = price + 150000 + 75000 + 100000;
      estTotal.textContent = "Rp " + formatCurrency(biayaTotal);
    }
  }

  document
    .getElementById("duration")
    .addEventListener("change", updateBookingSummary);
  document
    .getElementById("booking_date")
    .addEventListener("change", updateBookingSummary);

  bookingFormEl.addEventListener("submit", async function (e) {
    e.preventDefault();
    clearAlert(bookingAlertEl);
    var btn = bookingFormEl.querySelector('[type="submit"]');
    setButtonLoading(btn, true);

    var tanggal_masuk = document.getElementById("booking_date").value;
    var durasi_bulan = document.getElementById("duration").value;
    var metodeEl = document.getElementById("metode_bayar");
    var metode_bayar = metodeEl ? metodeEl.value : "transfer";

    if (!kosId || !tanggal_masuk || !durasi_bulan) {
      showAlert(bookingAlertEl, "Lengkapi semua field wajib.");
      setButtonLoading(btn, false);
      return;
    }

    var res = await postRequest("/api/booking", {
      kos_id: Number(kosId),
      tanggal_masuk: tanggal_masuk,
      durasi_bulan: Number(durasi_bulan),
      metode_bayar: metode_bayar,
    });
    setButtonLoading(btn, false);
    if (!res.success) {
      showAlert(bookingAlertEl, res.message);
      return;
    }
    showAlert(
      bookingAlertEl,
      "Pemesanan berhasil! Total: Rp " + formatCurrency(res.data.total_harga),
      "success",
    );
    setTimeout(function () {
      window.location.href = "history.html";
    }, 2000);
  });

  loadKosDetails();
  var dateInput = document.getElementById("booking_date");
  if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];
}

// === Booking History Page ===
var historyEl = document.getElementById("bookingHistory");
if (historyEl) {
  requireAuth();
  var allBookings = [];

  function renderBookings(filter) {
    if (!filter) filter = "all";
    var filtered =
      filter === "all"
        ? allBookings
        : allBookings.filter(function (b) {
            return b.status === filter;
          });
    if (filtered.length === 0) {
      historyEl.innerHTML =
        '<div class="empty-state"><h3 class="empty-state-title">Belum ada pemesanan.</h3><a href="kos-list.html" class="btn-primary">Cari Kos</a></div>';
      return;
    }
    var statusMap = {
      pending: { text: "Menunggu" },
      confirmed: { text: "Konfirmasi" },
      completed: { text: "Selesai" },
      cancelled: { text: "Dibatalkan" },
    };
    historyEl.innerHTML = filtered
      .map(function (b) {
        var img = getDefaultKosImage(b.kos_id);
        var st = statusMap[b.status] || { text: b.status };
        return (
          '<div class="booking-card" style="background:var(--white);border:1px solid var(--gray-200);border-radius:12px;overflow:hidden;">' +
          '<div class="booking-card-content">' +
          '<div class="booking-image"><img src="' +
          img +
          '" alt="' +
          sanitizeInput(b.nama_kos) +
          '"></div>' +
          '<div class="booking-info">' +
          '<div class="booking-id">Pemesanan #' +
          b.pemesanan_id +
          "</div>" +
          '<h3 class="booking-kos-name">' +
          sanitizeInput(b.nama_kos || "-") +
          "</h3>" +
          '<div class="booking-meta">' +
          '<div class="booking-meta-item">' +
          formatDate(b.tanggal_masuk) +
          "</div>" +
          '<div class="booking-meta-item">' +
          b.durasi_bulan +
          " bulan</div>" +
          '<div class="booking-meta-item">Rp ' +
          formatCurrency(b.total_harga) +
          "</div>" +
          "</div>" +
          (b.pembayaran_metode
            ? '<div style="font-size:0.8rem;color:var(--gray-600);margin-top:0.25rem;">Bayar: ' +
              b.pembayaran_metode +
              " (" +
              b.pembayaran_status +
              ")</div>"
            : "") +
          "</div>" +
          '<div class="booking-actions"><div class="booking-status status-' +
          b.status +
          '">' +
          st.text +
          "</div></div>" +
          "</div></div>"
        );
      })
      .join("");
  }

  (async function () {
    var res = await getRequest("/api/booking/history");
    if (!res.success) {
      historyEl.innerHTML =
        '<p style="color:var(--danger);text-align:center;">Data belum ditemukan</p>';
      return;
    }
    allBookings = res.data || [];

    var statsEl = document.getElementById("bookingStats");
    if (statsEl && allBookings.length > 0) {
      statsEl.style.display = "grid";
      document.getElementById("statTotal").textContent = allBookings.length;
      document.getElementById("statPending").textContent = allBookings.filter(
        function (b) {
          return b.status === "pending";
        },
      ).length;
      document.getElementById("statConfirmed").textContent = allBookings.filter(
        function (b) {
          return b.status === "confirmed";
        },
      ).length;
      document.getElementById("statCancelled").textContent = allBookings.filter(
        function (b) {
          return b.status === "cancelled";
        },
      ).length;
    }
    renderBookings("all");
  })();

  document.querySelectorAll(".filter-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".filter-tab").forEach(function (t) {
        t.classList.remove("active");
      });
      this.classList.add("active");
      renderBookings(this.dataset.filter || "all");
    });
  });
}
