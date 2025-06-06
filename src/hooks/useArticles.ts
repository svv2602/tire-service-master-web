import { useState, useEffect, useCallback } from 'react';
import articlesApi from '../api/articles.api';
import type {
  Article,
  ArticleSummary,
  ArticlesListResponse,
  ArticleCategory,
  CreateArticleRequest,
  ArticlesFilters,
} from '../types/articles';

export const useArticles = (initialFilters: ArticlesFilters = {}) => {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    per_page: 12,
  });

  const fetchArticles = useCallback(async (filters: ArticlesFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response: ArticlesListResponse = await articlesApi.getArticles(filters);
      setArticles(response.data);
      setPagination(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке статей');
      console.error('Ошибка загрузки статей:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles(initialFilters);
  }, [fetchArticles, initialFilters]);

  const refetch = () => fetchArticles(initialFilters);

  return {
    articles,
    loading,
    error,
    pagination,
    fetchArticles,
    refetch,
  };
};

export const useArticle = (id: string | number | null) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticle = useCallback(async (articleId: string | number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await articlesApi.getArticle(articleId);
      setArticle(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке статьи');
      console.error('Ошибка загрузки статьи:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchArticle(id);
    }
  }, [id, fetchArticle]);

  const refetch = () => {
    if (id) {
      fetchArticle(id);
    }
  };

  return {
    article,
    loading,
    error,
    refetch,
  };
};

export const useArticleCategories = () => {
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await articlesApi.getCategories();
      setCategories(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке категорий');
      console.error('Ошибка загрузки категорий:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
};

export const useArticleActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createArticle = async (articleData: CreateArticleRequest): Promise<Article | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const article = await articlesApi.createArticle(articleData);
      return article;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании статьи');
      console.error('Ошибка создания статьи:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateArticle = async (id: number, articleData: Partial<CreateArticleRequest>): Promise<Article | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const article = await articlesApi.updateArticle(id, articleData);
      return article;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при обновлении статьи');
      console.error('Ошибка обновления статьи:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteArticle = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await articlesApi.deleteArticle(id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при удалении статьи');
      console.error('Ошибка удаления статьи:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createArticle,
    updateArticle,
    deleteArticle,
  };
};

export const usePopularArticles = (limit: number = 5) => {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPopularArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await articlesApi.getPopularArticles(limit);
      setArticles(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке популярных статей');
      console.error('Ошибка загрузки популярных статей:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchPopularArticles();
  }, [fetchPopularArticles]);

  return {
    articles,
    loading,
    error,
    refetch: fetchPopularArticles,
  };
};

export const useRelatedArticles = (articleId: number | null, limit: number = 3) => {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRelatedArticles = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await articlesApi.getRelatedArticles(id, limit);
      setArticles(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке связанных статей');
      console.error('Ошибка загрузки связанных статей:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    if (articleId) {
      fetchRelatedArticles(articleId);
    }
  }, [articleId, fetchRelatedArticles]);

  const refetch = () => {
    if (articleId) {
      fetchRelatedArticles(articleId);
    }
  };

  return {
    articles,
    loading,
    error,
    refetch,
  };
}; 