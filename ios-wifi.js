const WIFI_IOS = { ssid: 'Sec_CS3', password: 'S3cur3Netw0rk!24' };

function detectIOS() {
  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';
  return /iPad|iPhone|iPod/i.test(ua)
    || ((platform === 'MacIntel' || /Mac/i.test(ua)) && navigator.maxTouchPoints > 1);
}

async function copyWifiPassword() {
  try {
    await navigator.clipboard.writeText(WIFI_IOS.password);
    return true;
  } catch {
    return false;
  }
}

function buildIosWifiModal() {
  if (document.getElementById('ios-wifi-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'ios-wifi-modal';
  modal.className = 'ios-wifi-modal';
  modal.hidden = true;
  modal.innerHTML = `
    <div class="ios-wifi-backdrop" data-close-modal></div>
    <div class="ios-wifi-sheet" role="dialog" aria-labelledby="ios-wifi-title">
      <button type="button" class="ios-wifi-close" data-close-modal aria-label="Close">×</button>
      <h2 id="ios-wifi-title">連接 WiFi</h2>
      <p class="ios-wifi-status" id="ios-wifi-status"></p>
      <dl class="ios-wifi-creds">
        <div>
          <dt>網絡名稱</dt>
          <dd><code>${WIFI_IOS.ssid}</code></dd>
        </div>
        <div>
          <dt>密碼</dt>
          <dd><code id="ios-wifi-password">${WIFI_IOS.password}</code></dd>
        </div>
      </dl>
      <ol class="ios-wifi-steps">
        <li>打開「<strong>設定</strong>」→「<strong>WiFi</strong>」</li>
        <li>選擇「<strong>${WIFI_IOS.ssid}</strong>」</li>
        <li>長按密碼欄 →「<strong>貼上</strong>」</li>
        <li>按「<strong>加入</strong>」</li>
      </ol>
      <div class="ios-wifi-actions">
        <button type="button" class="ios-wifi-copy" id="ios-wifi-copy-btn">再複製密碼</button>
      </div>
      <p class="ios-wifi-note">無需安裝描述檔，跟以上步驟手動加入即可</p>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelectorAll('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', () => { modal.hidden = true; });
  });

  modal.querySelector('#ios-wifi-copy-btn').addEventListener('click', async (e) => {
    const ok = await copyWifiPassword();
    modal.querySelector('#ios-wifi-status').textContent = ok ? '密碼已複製' : '請長按上方密碼手動複製';
    e.currentTarget.textContent = ok ? '已複製！' : '複製失敗';
    setTimeout(() => { e.currentTarget.textContent = '再複製密碼'; }, 1500);
  });
}

async function openIosWifiGuide() {
  buildIosWifiModal();
  const modal = document.getElementById('ios-wifi-modal');
  const copied = await copyWifiPassword();
  modal.querySelector('#ios-wifi-status').textContent = copied
    ? '密碼已複製到剪貼簿'
    : '請長按下方密碼欄手動複製';
  modal.hidden = false;
}

window.openIosWifiGuide = openIosWifiGuide;

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-wifi-connect]');
  if (!btn || !detectIOS()) return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  openIosWifiGuide();
}, true);

if (detectIOS() && new URLSearchParams(location.search).get('ios') === '1') {
  document.addEventListener('DOMContentLoaded', openIosWifiGuide);
}
