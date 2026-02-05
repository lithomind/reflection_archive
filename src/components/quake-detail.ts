
import { formatIntensity } from '../services';

export function renderQuakeDetail(quake: any): string {
  const eq = quake.earthquake;
  const issue = quake.issue;
  const time = new Date(eq.time).toLocaleString('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  });
  
  const intensity = formatIntensity(eq.maxScale);
  const depth = eq.hypocenter.depth === -1 ? '不明' : `${eq.hypocenter.depth}km`;
  const magnitude = eq.hypocenter.magnitude === -1 ? '不明' : `M${eq.hypocenter.magnitude.toFixed(1)}`;
  
  const tsunamiMap: Record<string, string> = {
    'None': 'なし',
    'Unknown': '不明',
    'Checking': '調査中',
    'NonEffective': '若干の海面変動（被害の心配なし）',
    'Watch': '津波注意報',
    'Warning': '津波予報（若干の海面変動）'
  };
  const domesticTsunami = tsunamiMap[eq.domesticTsunami] || eq.domesticTsunami;

  // Group points by prefecture
  const pointsByPref: Record<string, any[]> = {};
  if (quake.points) {
    quake.points.forEach((p: any) => {
      if (!pointsByPref[p.pref]) pointsByPref[p.pref] = [];
      pointsByPref[p.pref].push(p);
    });
  }

  const pointsHtml = Object.keys(pointsByPref).map(pref => `
    <div class="quake-pref-group">
      <div class="pref-name">${pref}</div>
      <div class="pref-points">
        ${pointsByPref[pref].map(p => `
          <span class="point-item">
            <span class="point-addr">${p.addr}</span>
            <span class="point-scale">（震度${formatIntensity(p.scale)}）</span>
          </span>
        `).join('')}
      </div>
    </div>
  `).join('');

  return `
    <div class="quake-detail-view">
      <div class="formal-nav">
        <button class="formal-back-button" type="button">◀ アーカイブへ戻る</button>
      </div>
      
      <div class="formal-header">
        <div class="formal-label">地震詳細報告</div>
        <h1 class="formal-title">${eq.hypocenter.name || '調査中'}</h1>
      </div>

      <div class="formal-section">
        <h2 class="section-title">震源要素</h2>
        <div class="formal-grid">
          <div class="formal-cell">
            <div class="cell-label">発生時刻</div>
            <div class="cell-value">${time}</div>
          </div>
          <div class="formal-cell highlight-cell">
            <div class="cell-label">最大震度</div>
            <div class="cell-value highlight">震度${intensity}</div>
          </div>
          <div class="formal-cell">
            <div class="cell-label">マグニチュード</div>
            <div class="cell-value">${magnitude}</div>
          </div>
          <div class="formal-cell">
            <div class="cell-label">震源の深さ</div>
            <div class="cell-value">${depth}</div>
          </div>
          <div class="formal-cell">
            <div class="cell-label">緯度 / 経度</div>
            <div class="cell-value">北緯${eq.hypocenter.latitude.toFixed(1)}° / 東経${eq.hypocenter.longitude.toFixed(1)}°</div>
          </div>
          <div class="formal-cell">
            <div class="cell-label">津波の心配</div>
            <div class="cell-value">${domesticTsunami}</div>
          </div>
        </div>
      </div>

      <div class="formal-section">
        <h2 class="section-title">各地の震度</h2>
        <div class="points-container">
          ${pointsHtml || '<div class="no-data">震度観測データはありません</div>'}
        </div>
      </div>

      <div class="formal-section info-section">
        <h2 class="section-title">情報元</h2>
        <div class="info-grid">
          <span>発表元: ${issue.source}</span>
          <span>発表時刻: ${new Date(issue.time).toLocaleString('ja-JP')}</span>
          <span>情報の種類: ${issue.type}</span>
        </div>
      </div>

      <div class="formal-footer">
        <div>データ提供: P2P地震情報 API</div>
        <div>※情報は気象庁の発表に基づいています。</div>
      </div>
    </div>
  `;
}

export function attachQuakeDetailListeners(container: HTMLElement, onBackClick: () => void): void {
  const backBtn = container.querySelector('.formal-back-button');
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      onBackClick();
    });
  }
}
