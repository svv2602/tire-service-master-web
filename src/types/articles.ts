// Типы для системы управления статьями

export interface ArticleCategory {
  key: string;
  name: string;
  description: string;
  icon: string;
}

export interface ArticleAuthor {
  id: number;
  name: string;
  email: string;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  category_name: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  slug: string;
  featured_image: string;
  reading_time: number;
  views_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author_id: number;
  author: ArticleAuthor;
  meta_title?: string;
  meta_description?: string;
  gallery_images?: string[];
  tags?: string[];
  allow_comments?: boolean;
}

export interface ArticleSummary {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  category_name: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  slug: string;
  featured_image: string;
  reading_time: number;
  views_count: number;
  published_at: string | null;
  created_at: string;
  author_id: number;
  author: ArticleAuthor;
}

export interface ArticlesListResponse {
  data: ArticleSummary[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  status: 'draft' | 'published';
  featured?: boolean;
  meta_title?: string;
  meta_description?: string;
  featured_image_url?: string;
  allow_comments?: boolean;
  tags?: string[];
  gallery_images?: string[];
}

export interface UpdateArticleRequest extends Partial<CreateArticleRequest> {
  id: number;
}

export interface ArticlesFilters {
  query?: string;
  category?: string;
  featured?: boolean;
  include_drafts?: boolean;
  sort?: 'recent' | 'popular' | 'oldest';
  page?: number;
  per_page?: number;
}

export interface ArticleFormData {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  status: 'draft' | 'published';
  featured: boolean;
  meta_title: string;
  meta_description: string;
  featured_image_url: string;
  allow_comments: boolean;
  tags: string[];
}

// Константы статусов
export const ARTICLE_STATUSES = {
  DRAFT: 'draft' as const,
  PUBLISHED: 'published' as const,
  ARCHIVED: 'archived' as const,
};

export const ARTICLE_STATUS_LABELS = {
  [ARTICLE_STATUSES.DRAFT]: 'Черновик',
  [ARTICLE_STATUSES.PUBLISHED]: 'Опубликован',
  [ARTICLE_STATUSES.ARCHIVED]: 'В архиве',
};

// Константы сортировки
export const ARTICLE_SORT_OPTIONS = {
  RECENT: 'recent' as const,
  POPULAR: 'popular' as const,
  OLDEST: 'oldest' as const,
};

export const ARTICLE_SORT_LABELS = {
  [ARTICLE_SORT_OPTIONS.RECENT]: 'Сначала новые',
  [ARTICLE_SORT_OPTIONS.POPULAR]: 'Популярные',
  [ARTICLE_SORT_OPTIONS.OLDEST]: 'Сначала старые',
}; 