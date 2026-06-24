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
  return /iPad|iPhone|iPod/i.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function buildMobileConfig() {
  const wifiUuid = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
  const rootUuid = 'b2c3d4e5-f6a7-4890-b123-456789abcdef';
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>AutoJoin</key>
      <true/>
      <key>EncryptionType</key>
      <string>WPA</string>
      <key>HIDDEN_NETWORK</key>
      <false/>
      <key>Password</key>
      <string>${WIFI.password}</string>
      <key>PayloadDescription</key>
      <string>Inter-Departmental Cyber Security Drill WiFi</string>
      <key>PayloadDisplayName</key>
      <string>${WIFI.ssid}</string>
      <key>PayloadIdentifier</key>
      <string>com.trg.drill2026.wifi</string>
      <key>PayloadType</key>
      <string>com.apple.wifi.managed</string>
      <key>PayloadUUID</key>
      <string>${wifiUuid}</string>
      <key>PayloadVersion</key>
      <integer>1</integer>
      <key>SSID_STR</key>
      <string>${WIFI.ssid}</string>
    </dict>
  </array>
  <key>PayloadDisplayName</key>
  <string>${WIFI.ssid} WiFi</string>
  <key>PayloadIdentifier</key>
  <string>com.trg.drill2026</string>
  <key>PayloadRemovalDisallowed</key>
  <false/>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadUUID</key>
  <string>${rootUuid}</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
</dict>
</plist>`;
}

function installIosWifiProfile() {
  const blob = new Blob([buildMobileConfig()], { type: 'application/x-apple-aspen-config' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${WIFI.ssid}.mobileconfig`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showWifiToast('請按「安裝」加入 WiFi 網絡');
}

function connectWifi(fallbackUrl) {
  if (isIOS()) {
    installIosWifiProfile();
    return;
  }
  if (isAndroid()) {
    window.location.href = buildWifiUri();
    setTimeout(() => showWifiToast('如未彈出連接提示，請用下方 QR Code'), 2500);
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
      e.preventDefault();
      connectWifi(el.dataset.fallback || 'wifi.html');
    });
  });
}

function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
      } catch {
        btn.textContent = 'Failed';
        setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initWifiButtons();
  initCopyButtons();
});
