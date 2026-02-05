import './style.css';
import type { Article } from './types';
import { fetchArticles, getArticlesByCategory } from './data';
import { renderHeader, attachHeaderListeners } from './components/header';
import { renderArticleGrid, attachArticleGridListeners } from './components/article-grid';
import { renderSidebar, attachSidebarListeners } from './components/sidebar';
import { renderArticleDetail, attachArticleDetailListeners } from './components/article-detail';
import { renderQuakeDetail, attachQuakeDetailListeners } from './components/quake-detail';
import { fetchEarthquakeInfo, fetchWeatherInfo, getWeatherIcon, formatIntensity } from './services';

class NewsApp {
  private articles: Article[] = [];
  private currentView: 'home' | 'category' | 'article' | 'quake' = 'home';
  private currentCategory: string | null = null;
  private currentQuake: any = null;
  private appElement: HTMLElement;
  private mainElement: HTMLElement;
  private clockInterval?: number;
  
  // Caching for portal widgets
  private cachedQuakes: any[] | null = null;
  private cachedWeather: { data: any, label: string } | null = null;
  private isLocationAuthorized: boolean = false;

  constructor() {
    this.appElement = document.querySelector<HTMLDivElement>('#app')!;
    this.mainElement = document.createElement('div');
    this.mainElement.className = 'main-wrapper';
    this.init();
  }

  private async init(): Promise<void> {
    try {
      this.articles = await fetchArticles();
      this.render();
      this.startClock();
      this.loadEarthquakeInfo();
      this.initWeatherAuto();
    } catch (error) {
      console.error('Failed to load articles:', error);
      this.appElement.innerHTML = '<p>記事の読み込みに失敗しました。ページを再読み込みしてください。</p>';
    }
  }

  private startClock(): void {
    const updateClock = () => {
      const clockEl = document.getElementById('live-clock');
      if (clockEl) {
        const now = new Date();
        const dateStr = now.toLocaleDateString('ja-JP', { 
          year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' 
        });
        const timeStr = now.toLocaleTimeString('ja-JP', { 
          hour: '2-digit', minute: '2-digit', second: '2-digit' 
        });
        clockEl.textContent = `${dateStr} ${timeStr}`;
      }
    };
    updateClock();
    if (this.clockInterval) clearInterval(this.clockInterval);
    this.clockInterval = window.setInterval(updateClock, 1000);
  }

  private async loadEarthquakeInfo(): Promise<void> {
    const container = document.getElementById('earthquake-info');
    if (!container) return;

    // Use cache if available for instant display
    if (this.cachedQuakes) {
      this.renderQuakes(container, this.cachedQuakes);
    }

    const quakes = await fetchEarthquakeInfo();
    if (quakes && quakes.length > 0) {
      this.cachedQuakes = quakes;
      this.renderQuakes(container, quakes);
    } else if (!this.cachedQuakes) {
      container.innerHTML = '<div class="quake-no-info">最近の地震情報はありません</div>';
    }
  }

  private renderQuakes(container: HTMLElement, quakes: any[]): void {
    container.innerHTML = quakes.map((q: any, index: number) => {
      const time = new Date(q.earthquake.time).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
      const place = q.earthquake.hypocenter.name || '不明';
      const scale = q.earthquake.maxScale;
      const intensityStr = formatIntensity(scale);
      
      let intensityLevel = 'low';
      if (scale >= 45) intensityLevel = 'high';
      else if (scale >= 30) intensityLevel = 'mid';

      return `
        <div class="quake-item" role="button" tabindex="0" data-quake-index="${index}" style="cursor: pointer;">
          <span class="quake-time">${time}</span>
          <span class="quake-place">${place}</span>
          <span class="quake-intensity intensity-${intensityLevel}">震度${intensityStr}</span>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.quake-item').forEach(item => {
      item.addEventListener('click', () => {
        const index = parseInt((item as HTMLElement).dataset.quakeIndex || '0');
        this.handleQuakeClick(quakes[index]);
      });
    });
  }

  private initWeatherAuto(): void {
    if (this.cachedWeather) {
      this.renderWeather(this.cachedWeather.data, this.cachedWeather.label);
    } else {
      // Default load for header
      this.updateWeather(35.6895, 139.6917, "東京");
    }

    const btn = document.getElementById('btn-request-location');
    if (btn) {
      // If already authorized in this session, don't show prompt, just fetch
      if (this.isLocationAuthorized) {
        this.requestLocation();
      }

      btn.addEventListener('click', () => this.requestLocation());
    }
  }

  private requestLocation(): void {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.isLocationAuthorized = true;
          this.updateWeather(pos.coords.latitude, pos.coords.longitude, "現在地");
        },
        () => this.updateWeather(35.6895, 139.6917, "東京(標準)")
      );
    } else {
      this.updateWeather(35.6895, 139.6917, "東京(標準)");
    }
  }

  private async updateWeather(lat: number, lon: number, label: string): Promise<void> {
    const weatherData = await fetchWeatherInfo(lat, lon);
    if (!weatherData) return;
    
    this.cachedWeather = { data: weatherData, label };
    this.renderWeather(weatherData, label);
  }

  private renderWeather(weatherData: any, label: string): void {
    const temp = weatherData.current.temperature_2m;
    const code = weatherData.current.weather_code;
    const icon = getWeatherIcon(code);

    const headerWeather = document.getElementById('header-weather');
    if (headerWeather) {
      headerWeather.textContent = `${label}: ${icon} ${temp}℃`;
    }

    const sidebarWeather = document.getElementById('sidebar-weather-info');
    const permissionContainer = document.getElementById('weather-permission-container');
    if (sidebarWeather && permissionContainer) {
      permissionContainer.style.display = 'none';
      sidebarWeather.style.display = 'block';
      sidebarWeather.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 4px;">${label}の予報</div>
        <div style="font-size: 16px;">${icon}</div>
        <div style="font-size: 20px; font-weight: 900;">${temp}℃</div>
      `;
    }
  }

  private render(): void {
    this.appElement.innerHTML = '';
    
    // Render header
    const headerHtml = renderHeader();
    this.appElement.insertAdjacentHTML('beforeend', headerHtml);
    
    const header = this.appElement.querySelector('.header');
    if (header) {
      attachHeaderListeners(
        header as HTMLElement,
        (category) => this.handleCategoryClick(category),
        () => this.handleHomeClick()
      );
    }

    // Render main content
    this.renderMainContent();
    this.appElement.appendChild(this.mainElement);
  }

  private renderMainContent(): void {
    this.mainElement.innerHTML = '';

    // Create content area
    const contentArea = document.createElement('div');
    contentArea.className = 'content-area';

    if (this.currentView === 'article' && this.currentCategory) {
      // Article detail view - full width, no sidebar
      const article = this.articles.find(a => a.id === this.currentCategory);
      if (article) {
        const detailHtml = renderArticleDetail(article, () => this.handleBackClick());
        contentArea.insertAdjacentHTML('beforeend', detailHtml);
        attachArticleDetailListeners(contentArea, () => this.handleBackClick());
        contentArea.style.display = 'block'; // Full width for detail
      }
    } else if (this.currentView === 'quake' && this.currentQuake) {
      // Specialized Quake detail view
      const detailHtml = renderQuakeDetail(this.currentQuake);
      contentArea.insertAdjacentHTML('beforeend', detailHtml);
      attachQuakeDetailListeners(contentArea, () => this.handleBackClick());
      contentArea.style.display = 'block';
    } else {
      contentArea.style.display = 'grid';
      // Home or category view - with sidebar
      let displayArticles = this.articles;
      
      if (this.currentView === 'category' && this.currentCategory) {
        displayArticles = getArticlesByCategory(this.articles, this.currentCategory);
      }

      // Create main content wrapper
      const mainContent = document.createElement('main');
      mainContent.className = 'main';

      // Article grid
      const gridHtml = renderArticleGrid(displayArticles);
      mainContent.insertAdjacentHTML('beforeend', gridHtml);
      attachArticleGridListeners(mainContent, displayArticles, (article) => this.handleArticleClick(article));

      contentArea.appendChild(mainContent);

      // Render sidebar
      const recentArticles = [...this.articles].sort((a, b) => 
        new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime()
      );
      const popularArticles = [...this.articles].slice(0, 5);
      
      const sidebarHtml = renderSidebar(recentArticles, popularArticles);
      contentArea.insertAdjacentHTML('beforeend', sidebarHtml);
      
      const sidebar = contentArea.querySelector('.sidebar');
      if (sidebar) {
        attachSidebarListeners(sidebar as HTMLElement, recentArticles, popularArticles, (article) => this.handleArticleClick(article));
      }
    }

    this.mainElement.appendChild(contentArea);

    // Trigger updates after elements are attached
    this.triggerDynamicUpdates();
  }

  private triggerDynamicUpdates(): void {
    if (document.getElementById('live-clock')) {
      this.startClock();
    }
    if (document.getElementById('earthquake-info')) {
      this.loadEarthquakeInfo();
    }
    if (document.getElementById('btn-request-location')) {
      this.initWeatherAuto();
    }
  }

  private handleCategoryClick(category: string): void {
    this.currentView = 'category';
    this.currentCategory = category;
    this.renderMainContent();
    window.scrollTo(0, 0);
  }

  private handleHomeClick(): void {
    this.currentView = 'home';
    this.currentCategory = null;
    this.renderMainContent();
    window.scrollTo(0, 0);
  }

  private handleArticleClick(article: Article): void {
    this.currentView = 'article';
    this.currentCategory = article.id;
    this.renderMainContent();
    window.scrollTo(0, 0);
  }

  private handleBackClick(): void {
    this.currentView = 'home';
    this.currentCategory = null;
    this.currentQuake = null;
    this.renderMainContent();
    window.scrollTo(0, 0);
  }

  private handleQuakeClick(quake: any): void {
    this.currentView = 'quake';
    this.currentQuake = quake;
    this.renderMainContent();
    window.scrollTo(0, 0);
  }

}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new NewsApp();
});
