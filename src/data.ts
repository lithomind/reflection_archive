import type { Article } from './types';

export async function fetchArticles(): Promise<Article[]> {
  const baseUrl = import.meta.env.BASE_URL;
  const indexResponse = await fetch(`${baseUrl}articles/index.json`);
  if (!indexResponse.ok) {
    throw new Error('Failed to fetch article index');
  }
  
  const articleFiles: string[] = await indexResponse.json();
  
  const articlePromises = articleFiles.map(async (filename) => {
    const res = await fetch(`${baseUrl}articles/${filename}`);
    if (!res.ok) {
      console.warn(`Failed to fetch article: ${filename}`);
      return null;
    }
    
    if (filename.endsWith('.md')) {
      const text = await res.text();
      const { data, content } = parseFrontmatter(text);
      return {
        ...data,
        content: content
      } as Article;
    }
    
    return res.json();
  });

  const results = await Promise.all(articlePromises);
  return results.filter((article): article is Article => article !== null);
}

function parseFrontmatter(text: string): { data: any, content: string } {
  const regex = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n([\s\S]*)$/;
  const match = text.match(regex);
  
  if (!match) return { data: {}, content: text };
  
  const yamlBlock = match[1];
  const content = match[2];
  const data: any = {};
  
  yamlBlock.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      // Remove surrounding quotes if any
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      data[key] = value;
    }
  });
  
  return { data, content };
}

export function getArticlesByCategory(articles: Article[], category: string): Article[] {
  return articles.filter(article => article.category === category);
}

export function getArticleById(articles: Article[], id: string): Article | undefined {
  return articles.find(article => article.id === id);
}
