import type { Article } from '../types';

export function renderArticleDetail(article: Article, _onBackClick: () => void): string {
  const paragraphs = article.content.split('\n\n');
  const contentHtml = paragraphs.map(p => {
    if (p.startsWith('### ')) {
      return `<h3 class="article-detail-section-title">${p.replace('### ', '')}</h3>`;
    }
    return `<p>${p}</p>`;
  }).join('\n');

  return `
    <article class="article-detail">
      <button class="back-button" type="button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        一覧に戻る
      </button>
      <header class="article-detail-header">
        <div class="article-detail-category-badge">${article.category}</div>
        <h1 class="article-detail-title">${article.title}</h1>
        <div class="article-detail-meta">
          <span class="article-detail-author">${article.author}</span>
          <span class="article-detail-separator">·</span>
          <time class="article-detail-datetime">${formatDate(article.date)} ${article.time} 公開</time>
        </div>
      </header>
      <div class="article-detail-image">
        <img src="${article.image}" alt="${article.title}">
      </div>
      <div class="article-detail-body">
        ${contentHtml}
      </div>
      <footer class="article-detail-footer">
        <div class="article-detail-keywords">
          <span class="keywords-label">関連キーワード:</span>
          <span class="keyword-tag">#${article.category}</span>
          <span class="keyword-tag">#ReflectionArchive</span>
          <span class="keyword-tag">#知の探究</span>
        </div>
      </footer>
    </article>
  `;
}

export function attachArticleDetailListeners(container: HTMLElement, onBackClick: () => void): void {
  const backButton = container.querySelector('.back-button');
  if (backButton) {
    backButton.addEventListener('click', onBackClick);
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
