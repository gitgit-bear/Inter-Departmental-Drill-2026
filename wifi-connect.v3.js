const WIFI = {
  ssid: 'Sec_CS3',
  password: 'S3cur3Netw0rk!24',
  security: 'WPA',
};

function escapeWifiField(value) {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/"/g, '\\"');
}

function buildWifiUri() {
  const s = escapeWifiField(WIFI.ssid);
  const p = escapeWifiField(WIFI.password);
  return `WIFI:T:${WIFI.security};S:${s};P:${p};H:false;;`;
}

function isIOS() {
  return typeof detectIOS === 'function' ? detectIOS() : false;
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function connectWifi(fallbackUrl) {
  if (isIOS()) return;
  if (isAndroid()) {
    window.location.href = buildWifiUri();
    setTimeout(() => showWifiToast('如未彈出連接提示，請用 QR Code'), 2500);
    return;
  }
  window.location.href = fallbackUrl || 'wifi.html';
}

function showWifiToast(message) {
  let toast = document.getElementById('wifi-toast');
  if (!toast) {
    toast = document.createElement('p');
    toast.id = 'wifi-toast';
    toast.className = 'wifi-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showWifiToast._timer);
  showWifiToast._timer = setTimeout(() => { toast.hidden = true; }, 5000);
}

function initWifiButtons() {
  document.querySelectorAll('[data-wifi-connect]').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (isIOS()) return;
      e.preventDefault();
      connectWifi(el.dataset.fallback || 'wifi.html');
    });
  });
}

function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      const ok = await copyText(text);
      btn.textContent = ok ? 'Copied!' : 'Failed';
      setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initWifiButtons();
  initCopyButtons();
});
