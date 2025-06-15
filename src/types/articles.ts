// Типы для статей
export interface ArticleSummary {
  id: number;
  title: string;
  excerpt?: string;
  category: string;
  category_name?: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  featured_image?: string;
  views_count?: number;
  reading_time?: number;
  author?: {
    id: number;
    name: string;
  };
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  category_name?: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  featured_image?: string;
  tags: string[];
  reading_time?: number;
  views_count?: number;
  author_id: number;
  author?: {
    id: number;
    name: string;
    email: string;
  };
  published_at?: string;
  created_at: string;
  updated_at: string;
  meta_title?: string;
  meta_description?: string;
  allow_comments?: boolean;
}

export interface ArticleFormData {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  status: string;
  featured: boolean;
  meta_title: string;
  meta_description: string;
  featured_image_url: string;
  allow_comments: boolean;
  tags: string[];
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  status: string;
  featured: boolean;
  meta_title?: string;
  meta_description?: string;
  featured_image_url?: string;
  allow_comments: boolean;
  tags?: string[];
}

export interface ArticlesFilters {
  category?: string;
  featured?: boolean;
  search?: string;
  page?: number;
  per_page?: number;
  status?: string;
  published?: boolean;
}

export interface ArticleCategory {
  key: string;
  name: string;
  icon: string;
}

export const ARTICLE_STATUS_LABELS = {
  draft: 'Черновик',
  published: 'Опубликовано',
  archived: 'Архив'
} as const;

export const ARTICLE_STATUSES = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
} as const;

export const ARTICLE_CATEGORIES: ArticleCategory[] = [
  { key: 'selection', name: 'Выбор шин', icon: '🔍' },
  { key: 'maintenance', name: 'Обслуживание', icon: '🔧' },
  { key: 'seasonal', name: 'Сезонность', icon: '🌦️' },
  { key: 'safety', name: 'Безопасность', icon: '🛡️' },
  { key: 'tips', name: 'Советы', icon: '💡' }
];
