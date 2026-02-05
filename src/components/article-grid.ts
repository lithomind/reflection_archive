import type { Article } from '../types';
import { renderArticleCard, attachArticleCardListeners } from './article-card';

export function renderArticleGrid(articles: Article[]): string {
  if (articles.length === 0) {
    return '<div class="article-grid-empty">記事が見つかりませんでした</div>';
  }

  const cardsHtml = articles.map(article => renderArticleCard(article)).join('');

  return `
    <section class="article-grid">
      ${cardsHtml}
    </section>
  `;
}

export function attachArticleGridListeners(
  container: HTMLElement, 
  articles: Article[], 
  onArticleClick: (article: Article) => void
): void {
  const cards = container.querySelectorAll('.article-card');
  cards.forEach((card, index) => {
    const article = articles[index];
    if (article) {
      attachArticleCardListeners(card as HTMLElement, () => onArticleClick(article));
    }
  });
}
