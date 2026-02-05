export interface Article {
  id: string;
  title: string;
  category: Category;
  date: string;
  time: string;
  author: string;
  summary: string;
  content: string;
  image: string;
  tags?: string[];
}

export type Category = 
  | '自然科学' 
  | '数理・論理' 
  | '先端技術' 
  | '科学哲学' 
  | '社会工学' 
  | '芸術工学';

export const CATEGORIES: Category[] = [
  '自然科学',
  '数理・論理',
  '先端技術',
  '科学哲学',
  '社会工学',
  '芸術工学'
];
