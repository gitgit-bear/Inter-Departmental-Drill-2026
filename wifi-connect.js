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

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function ensureIosModal() {
  let modal = document.getElementById('ios-wifi-modal');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.id = 'ios-wifi-modal';
  modal.className = 'ios-wifi-modal';
  modal.hidden = true;
  modal.innerHTML = `
    <div class="ios-wifi-backdrop" data-close-modal></div>
    <div class="ios-wifi-sheet" role="dialog" aria-labelledby="ios-wifi-title">
      <button type="button" class="ios-wifi-close" data-close-modal aria-label="Close">×</button>
      <h2 id="ios-wifi-title">連接 WiFi</h2>
      <p class="ios-wifi-status" id="ios-wifi-status">密碼已複製到剪貼簿</p>
      <dl class="ios-wifi-creds">
        <div>
          <dt>網絡名稱</dt>
          <dd><code id="ios-wifi-ssid"></code></dd>
        </div>
        <div>
          <dt>密碼</dt>
          <dd><code id="ios-wifi-password"></code></dd>
        </div>
      </dl>
      <ol class="ios-wifi-steps">
        <li>打開「<strong>設定</strong>」→「<strong>WiFi</strong>」</li>
        <li>選擇「<strong>${WIFI.ssid}</strong>」</li>
        <li>長按密碼欄 →「<strong>貼上</strong>」</li>
        <li>按「<strong>加入</strong>」</li>
      </ol>
      <div class="ios-wifi-actions">
        <button type="button" class="ios-wifi-copy" data-copy-password>再複製密碼</button>
      </div>
      <p class="ios-wifi-note">iPhone 不支援網頁直接連接 WiFi，請用以上步驟手動加入（無需安裝描述檔）</p>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector('#ios-wifi-ssid').textContent = WIFI.ssid;
  modal.querySelector('#ios-wifi-password').textContent = WIFI.password;

  modal.querySelectorAll('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', () => { modal.hidden = true; });
  });

  modal.querySelector('[data-copy-password]').addEventListener('click', async (e) => {
    const ok = await copyText(WIFI.password);
    const status = modal.querySelector('#ios-wifi-status');
    status.textContent = ok ? '密碼已複製' : '請長按上方密碼手動複製';
    e.currentTarget.textContent = ok ? '已複製！' : '複製失敗';
    setTimeout(() => { e.currentTarget.textContent = '再複製密碼'; }, 1500);
  });

  return modal;
}

async function connectIosWifi() {
  const copied = await copyText(WIFI.password);
  const modal = ensureIosModal();
  const status = modal.querySelector('#ios-wifi-status');
  status.textContent = copied
    ? '密碼已複製到剪貼簿'
    : '請長按下方密碼欄手動複製';
  modal.hidden = false;
}

function connectWifi(fallbackUrl) {
  if (isIOS()) {
    connectIosWifi();
    return;
  }
  if (isAndroid()) {
    window.location.href = buildWifiUri();
    setTimeout(() => showWifiToast('如未彈出連接提示，請用 QR Code 頁面'), 2500);
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
