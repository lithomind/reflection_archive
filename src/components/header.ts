import { CATEGORIES } from '../types';
import type { Category } from '../types';

export function renderHeader(): string {
  const categoryLinks = CATEGORIES.map((category: Category) => 
    `<a href="#" class="nav-link" data-category="${category}">${category}</a>`
  ).join('');

  const today = new Date();
  const dateStr = today.toLocaleDateString('ja-JP', { 
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' 
  });

  return `
    <header class="header">
      <div class="utility-bar">
        <div class="utility-container">
          <div class="utility-date" id="live-clock">${dateStr}</div>
          <div class="utility-weather" id="header-weather">取得中...</div>
        </div>
      </div>
      <div class="header-container">
        <div class="logo" role="button" tabindex="0">
          <img src="logo.png" alt="Reflection ARCHIVE" class="logo-image">
        </div>
        <div class="header-right">
           <!-- Ad removed -->
        </div>
      </div>
      <nav class="nav">
        <a href="#" class="nav-link" id="home-link">トップ</a>
        ${categoryLinks}
      </nav>
    </header>
  `;
}

export function attachHeaderListeners(
  container: HTMLElement, 
  onCategoryClick: (category: string) => void, 
  onHomeClick: () => void
): void {
  const logo = container.querySelector('.logo');
  if (logo) {
    logo.addEventListener('click', onHomeClick);
  }

  const homeLink = container.querySelector('#home-link');
  if (homeLink) {
    homeLink.addEventListener('click', (e) => {
      e.preventDefault();
      onHomeClick();
    });
  }

  const navLinks = container.querySelectorAll('.nav-link[data-category]');
  navLinks.forEach(link => {
    link.addEventListener('click', ((e: Event) => {
      e.preventDefault();
      const category = (e.currentTarget as HTMLElement).dataset.category;
      if (category) {
        onCategoryClick(category);
      }
    }) as EventListener);
  });
}
