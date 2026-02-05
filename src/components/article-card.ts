import type { Article } from '../types';

export function renderArticleCard(article: Article): string {
  const publishDate = new Date(`${article.date}T${article.time}`);
  const now = new Date();
  const diffInMs = now.getTime() - publishDate.getTime();
  const isNew = diffInMs > 0 && diffInMs < 24 * 60 * 60 * 1000;
  
  return `
    <article class="article-card" role="button" tabindex="0" data-article-id="${article.id}">
      <div class="article-card-content">
        <h2 class="article-card-title">
          ${isNew ? '<span class="badge-new">NEW</span>' : ''}
          ${article.title}
        </h2>
        <div class="article-card-excerpt">
          ${article.content}
        </div>
        <div class="article-card-tags">
          ${(article.tags || []).map(tag => `<span class="tag ${tag === '受験対策' ? 'tag-exam' : ''}">${tag}</span>`).join('')}
        </div>
        <div class="article-card-meta">
          <span class="article-card-category">${article.category}</span>
          <span class="article-card-separator">|</span>
          <time class="article-card-date">${article.time}</time>
        </div>
      </div>
    </article>
  `;
}

export function attachArticleCardListeners(card: HTMLElement, onClick: () => void): void {
  card.addEventListener('click', onClick);
}
