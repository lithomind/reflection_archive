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
        <h3 class="sidebar-title">気象情報</h3>
        <div id="weather-permission-container" class="sidebar-widget">
          <p>現地の予報を表示するには位置情報が必要です。</p>
          <button id="btn-request-location" class="sidebar-button">位置情報を許可</button>
        </div>
        <div id="sidebar-weather-info" class="sidebar-widget" style="display: none;">
          <!-- Content injected via JS -->
        </div>
      </section>

      <section class="sidebar-section">
        <h3 class="sidebar-title">地震情報</h3>
        <div id="earthquake-info" class="sidebar-widget">
          読み込み中...
        </div>
      </section>

      <section class="sidebar-section">
        <h3 class="sidebar-title">最近の記事</h3>
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
