// @ts-nocheck
/**
 * frontend/js/auth.ts
 * TEKNIK: Defensive Programming — validasi input sebelum kirim ke server
 */

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    return null;
  }
}

function isLoggedIn() {
  return !!localStorage.getItem("token");
}

function saveAuth(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

function requireAuth(redirectUrl) {
  if (!redirectUrl) redirectUrl = "login.html";
  if (!localStorage.getItem("token")) window.location.href = redirectUrl;
}

function logout() {
  if (confirm("Apakah Anda yakin ingin keluar?")) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "index.html";
  }
}

window.logout = logout;

// Update navbar berdasarkan status login
function updateNavbar() {
  var navbarMenu = document.querySelector(".navbar-menu");
  if (!navbarMenu) return;

  var user = getUser();
  if (isLoggedIn() && user) {
    navbarMenu.innerHTML =
      '<ul class="navbar-links">' +
      '<li><a href="index.html" class="nav-link">Beranda</a></li>' +
      '<li><a href="kos-list.html" class="nav-link">Cari Kos</a></li>' +
      '<li><a href="compare.html" class="nav-link">Bandingkan</a></li>' +
      '<li><a href="wishlist.html" class="nav-link">Wishlist</a></li>' +
      '<li><a href="history.html" class="nav-link">Riwayat</a></li>' +
      "</ul>" +
      '<div style="display:flex;align-items:center;gap:0.75rem;">' +
      '<div style="display:flex;align-items:center;gap:0.5rem;padding:0.5rem 1rem;background:var(--gray-100);border:1px solid var(--gray-200);border-radius:8px;">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--primary);"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>' +
      '<span style="font-weight:600;color:var(--gray-900);font-size:0.9375rem;">' +
      sanitizeInput(user.nama) +
      "</span>" +
      "</div>" +
      '<button onclick="logout()" class="btn-outline" style="padding:0.5rem 1rem;font-size:0.875rem;">Keluar</button>' +
      "</div>";
  }

  // Highlight active link
  var currentPath = window.location.pathname.split("/").pop() || "";
  document.querySelectorAll(".nav-link").forEach(function (link) {
    var href = link.getAttribute("href") || "";
    if (href === currentPath) link.classList.add("active");
    else link.classList.remove("active");
  });
}

document.addEventListener("DOMContentLoaded", updateNavbar);

// Login form handler
var loginForm = document.getElementById("loginForm");
if (loginForm) {
  if (isLoggedIn()) window.location.href = "index.html";

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    var alertEl = document.getElementById("loginAlert");
    var btn = loginForm.querySelector('[type="submit"]');
    clearAlert(alertEl);
    setButtonLoading(btn, true);

    var email = document.getElementById("email").value.trim();
    var password = document.getElementById("password").value;

    if (!email || !password) {
      setButtonLoading(btn, false);
      showAlert(alertEl, "Email dan password harus diisi");
      return;
    }

    var res = await postRequest("/api/auth/login", {
      email: email,
      password: password,
    });
    setButtonLoading(btn, false);

    if (!res.success) {
      showAlert(alertEl, res.message);
      return;
    }
    saveAuth(res.data.token, res.data.user);
    window.location.href = "kos-list.html";
  });
}

// Register form handler
var registerForm = document.getElementById("registerForm");
if (registerForm) {
  if (isLoggedIn()) window.location.href = "index.html";

  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    var alertEl = document.getElementById("registerAlert");
    var btn = registerForm.querySelector('[type="submit"]');
    clearAlert(alertEl);
    setButtonLoading(btn, true);

    var nama = document.getElementById("fullname").value.trim();
    var email = document.getElementById("email").value.trim();
    var password = document.getElementById("password").value;
    var no_telepon = document.getElementById("no_telepon")
      ? document.getElementById("no_telepon").value.trim()
      : "";

    if (!nama || !email || !password) {
      setButtonLoading(btn, false);
      showAlert(alertEl, "Nama, email, dan password harus diisi");
      return;
    }
    if (password.length < 6) {
      setButtonLoading(btn, false);
      showAlert(alertEl, "Password minimal 6 karakter");
      return;
    }

    var res = await postRequest("/api/auth/register", {
      nama: nama,
      email: email,
      password: password,
      no_telepon: no_telepon,
    });
    setButtonLoading(btn, false);

    if (!res.success) {
      showAlert(alertEl, res.message);
      return;
    }
    showAlert(alertEl, "Registrasi berhasil! Silakan login.", "success");
    setTimeout(function () {
      window.location.href = "login.html";
    }, 1500);
  });
}
