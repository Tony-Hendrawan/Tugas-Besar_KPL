// @ts-nocheck
/**
 * frontend/js/api.ts
 * TEKNIK: Code Reuse — central fetch handler untuk semua API calls
 */

function authHeaders() {
  var token = localStorage.getItem("token");
  return token ? { Authorization: "Bearer " + token } : {};
}

async function apiFetch(url, options) {
  if (!options) options = {};
  try {
    var res = await fetch(url, {
      method: options.method || "GET",
      headers: Object.assign(
        { "Content-Type": "application/json" },
        authHeaders(),
        options.headers || {},
      ),
      body: options.body || undefined,
    });

    var contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return {
        success: false,
        data: null,
        message: "Server returned non-JSON response (" + res.status + ")",
      };
    }

    var json = await res.json();
    if (!res.ok)
      return {
        success: false,
        data: null,
        message: json.message || "HTTP " + res.status,
      };
    return json;
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.message || "Network error",
    };
  }
}

function getRequest(url) {
  return apiFetch(url, { method: "GET" });
}

function postRequest(url, body) {
  return apiFetch(url, { method: "POST", body: JSON.stringify(body) });
}

function putRequest(url, body) {
  return apiFetch(url, { method: "PUT", body: JSON.stringify(body) });
}

function patchRequest(url, body) {
  return apiFetch(url, { method: "PATCH", body: JSON.stringify(body) });
}
