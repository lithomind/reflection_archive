import type { Article } from '../types';

export function renderSidebar(recentArticles: Article[], _popularArticles: Article[]): string {
  const recentHtml = recentArticles.slice(0, 8).map(article => `
    <li class="sidebar-article-item" role="button" tabindex="0" data-article-id="${article.id}">
      <span class="sidebar-article-title">${article.title}</span>
    </li>
  `).join('');


  return `
    <aside class="sidebar">
      <section class="sidebar-section">
        <h3 class="sidebar-title">ARCHIVE INSIGHT</h3>
        <div class="widget-insight" style="font-size: 11px; line-height: 1.5;">
          <strong>今日の一言：</strong><br>
          「真理は深き淵にあり」<br>
          <span style="color: #666;">（デモクリトス）</span>
        </div>
      </section>

      <section class="sidebar-section">
        <h3 class="sidebar-title">気象・位置情報</h3>
        <div id="weather-permission-container" style="font-size: 11px; line-height: 1.4;">
          <p>現地の正確な予報を表示するため、位置情報を取得します。<br>
          <span style="color: #666;">※静的なサイトであり、データは天気予報の取得にのみ使用されます。</span></p>
          <button id="btn-request-location" style="margin-top: 8px; width: 100%; padding: 4px; font-size: 11px; cursor: pointer;">位置情報を許可する</button>
        </div>
        <div id="sidebar-weather-info" style="display: none; font-size: 12px;">
          <!-- Content injected via JS -->
        </div>
      </section>

      <section class="sidebar-section">
        <h3 class="sidebar-title">地震情報 (P2PQuake)</h3>
        <div id="earthquake-info" style="font-size: 11px; line-height: 1.4;">
          更新中...
        </div>
      </section>

      <section class="sidebar-section">
        <h3 class="sidebar-title">最近の記事 <span>一覧</span></h3>
        <ul class="sidebar-article-list">
          ${recentHtml}
        </ul>
      </section>
    </aside>
  `;
}

export function attachSidebarListeners(
  container: HTMLElement,
  recentArticles: Article[],
  popularArticles: Article[],
  onArticleClick: (article: Article) => void
): void {
  const allArticles = [...recentArticles, ...popularArticles];
  const items = container.querySelectorAll('.sidebar-article-item');
  
  items.forEach(item => {
    const articleId = item.getAttribute('data-article-id');
    const article = allArticles.find(a => a.id === articleId);
    
    if (article) {
      item.addEventListener('click', () => onArticleClick(article));
    }
  });
}
