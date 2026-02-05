import type { Article } from './types';

export async function fetchArticles(): Promise<Article[]> {
  const indexResponse = await fetch('articles/index.json');
  if (!indexResponse.ok) {
    throw new Error('Failed to fetch article index');
  }
  
  const articleFiles: string[] = await indexResponse.json();
  
  const articlePromises = articleFiles.map(async (filename) => {
    const res = await fetch(`articles/${filename}`);
    if (!res.ok) {
      console.warn(`Failed to fetch article: ${filename}`);
      return null;
    }
    return res.json();
  });

  const results = await Promise.all(articlePromises);
  return results.filter((article): article is Article => article !== null);
}

export function getArticlesByCategory(articles: Article[], category: string): Article[] {
  return articles.filter(article => article.category === category);
}

export function getArticleById(articles: Article[], id: string): Article | undefined {
  return articles.find(article => article.id === id);
}
