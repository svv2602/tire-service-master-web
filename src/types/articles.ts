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
  
  // Поля для локализации
  title_ru?: string;
  content_ru?: string;
  excerpt_ru?: string;
  meta_title_ru?: string;
  meta_description_ru?: string;
  title_uk?: string;
  content_uk?: string;
  excerpt_uk?: string;
  meta_title_uk?: string;
  meta_description_uk?: string;
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
    email?: string;
  };
  published_at?: string;
  created_at: string;
  updated_at: string;
  allow_comments: boolean;
  
  // Поля для локализации
  title_ru?: string;
  content_ru?: string;
  excerpt_ru?: string;
  meta_title_ru?: string;
  meta_description_ru?: string;
  title_uk?: string;
  content_uk?: string;
  excerpt_uk?: string;
  meta_title_uk?: string;
  meta_description_uk?: string;
}

export interface ArticleFormData {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  status: 'draft' | 'published';
  featured: boolean;
  featured_image_url: string;
  tags: string[];
  allow_comments: boolean;
  
  // Поля для локализации
  title_ru?: string;
  content_ru?: string;
  excerpt_ru?: string;
  meta_title_ru?: string;
  meta_description_ru?: string;
  title_uk?: string;
  content_uk?: string;
  excerpt_uk?: string;
  meta_title_uk?: string;
  meta_description_uk?: string;
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  status: 'draft' | 'published';
  featured?: boolean;
  featured_image_url?: string;
  tags?: string[];
  allow_comments?: boolean;
  
  // Поля для локализации
  title_ru?: string;
  content_ru?: string;
  excerpt_ru?: string;
  meta_title_ru?: string;
  meta_description_ru?: string;
  title_uk?: string;
  content_uk?: string;
  excerpt_uk?: string;
  meta_title_uk?: string;
  meta_description_uk?: string;
}

export interface ArticleCategory {
  key: string;
  name: string;
  icon: string;
}

export interface ArticlesFilters {
  category?: string;
  status?: string;
  featured?: boolean;
  query?: string;
  page?: number;
  per_page?: number;
  locale?: string;
}

export interface ArticlesResponse {
  data: Article[];
  meta: {
    current_page: number;
    per_page: number;
    total_pages: number;
    total_count: number;
  };
}

// Константы статусов
export const ARTICLE_STATUSES = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
} as const;

export const ARTICLE_STATUS_LABELS = {
  draft: 'Черновик',
  published: 'Опубликовано',
  archived: 'Архив'
} as const;

// Функция для получения локализованных категорий
export const getLocalizedArticleCategories = (t: any): ArticleCategory[] => [
  { key: 'selection', name: t('forms.articles.form.categories.selection'), icon: '🔍' },
  { key: 'maintenance', name: t('forms.articles.form.categories.maintenance'), icon: '🔧' },
  { key: 'seasonal', name: t('forms.articles.form.categories.seasonal'), icon: '🌦️' },
  { key: 'safety', name: t('forms.articles.form.categories.safety'), icon: '🛡️' },
  { key: 'tips', name: t('forms.articles.form.categories.tips'), icon: '💡' }
];

// Устаревшая константа - оставляем для совместимости
export const ARTICLE_CATEGORIES: ArticleCategory[] = [
  { key: 'selection', name: 'Выбор шин', icon: '🔍' },
  { key: 'maintenance', name: 'Обслуживание', icon: '🔧' },
  { key: 'seasonal', name: 'Сезонность', icon: '🌦️' },
  { key: 'safety', name: 'Безопасность', icon: '🛡️' },
  { key: 'tips', name: 'Советы', icon: '💡' }
];
