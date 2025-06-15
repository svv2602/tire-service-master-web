import { useState, useEffect } from 'react';
import { 
  useGetPublishedArticlesQuery,
  useGetArticleQuery,
  useGetCategoriesQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
  useGetPopularArticlesQuery,
  useGetRelatedArticlesQuery,
} from '../api/articles.api';
import { 
  Article, 
  ArticleSummary, 
  ArticlesFilters, 
  ArticleCategory,
  CreateArticleRequest 
} from '../types/articles';

// Хук для получения списка статей с фильтрацией и пагинацией
export const useArticles = (filters: ArticlesFilters = {}) => {
  const { data, error, isLoading, refetch } = useGetPublishedArticlesQuery(filters);
  
  return {
    articles: data?.data || [],
    pagination: data?.meta || {
      current_page: 1,
      per_page: 10,
      total_pages: 0,
      total_count: 0,
    },
    loading: isLoading,
    error: error ? (error as any)?.data?.message || 'Ошибка загрузки статей' : null,
    fetchArticles: () => refetch(),
  };
};

// Хук для получения отдельной статьи
export const useArticle = (id: string | number | null) => {
  const { data, error, isLoading } = useGetArticleQuery(Number(id)!, { 
    skip: !id 
  });
  
  return {
    article: data?.data || null,
    loading: isLoading,
    error: error ? (error as any)?.data?.message || 'Ошибка загрузки статьи' : null,
  };
};

// Хук для получения категорий статей
export const useArticleCategories = () => {
  const { data, error, isLoading } = useGetCategoriesQuery();
  
  return {
    categories: data || [],
    loading: isLoading,
    error: error ? (error as any)?.data?.message || 'Ошибка загрузки категорий' : null,
  };
};

// Хук для операций CRUD со статьями
export const useArticleActions = () => {
  const [createArticle, { isLoading: creating }] = useCreateArticleMutation();
  const [updateArticle, { isLoading: updating }] = useUpdateArticleMutation();
  const [deleteArticle, { isLoading: deleting }] = useDeleteArticleMutation();

  const handleCreate = async (articleData: CreateArticleRequest) => {
    try {
      const result = await createArticle(articleData).unwrap();
      return { success: true, data: result };
    } catch (error: any) {
      return { 
        success: false, 
        error: error?.data?.message || 'Ошибка создания статьи' 
      };
    }
  };

  const handleUpdate = async (id: number, articleData: Partial<CreateArticleRequest>) => {
    try {
      const result = await updateArticle({ id, article: articleData }).unwrap();
      return { success: true, data: result };
    } catch (error: any) {
      return { 
        success: false, 
        error: error?.data?.message || 'Ошибка обновления статьи' 
      };
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteArticle(id).unwrap();
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error?.data?.message || 'Ошибка удаления статьи' 
      };
    }
  };

  return {
    createArticle: handleCreate,
    updateArticle: handleUpdate,
    deleteArticle: handleDelete,
    loading: creating || updating || deleting,
  };
};

// Хук для получения популярных статей
export const usePopularArticles = (limit: number = 5) => {
  const { data, error, isLoading } = useGetPopularArticlesQuery();
  
  return {
    articles: data?.data || [],
    loading: isLoading,
    error: error ? (error as any)?.data?.message || 'Ошибка загрузки популярных статей' : null,
  };
};

// Хук для получения связанных статей
export const useRelatedArticles = (articleId: number | null, limit: number = 3) => {
  const { data, error, isLoading } = useGetRelatedArticlesQuery(
    { articleId: articleId! },
    { skip: !articleId }
  );
  
  return {
    articles: data?.data || [],
    loading: isLoading,
    error: error ? (error as any)?.data?.message || 'Ошибка загрузки связанных статей' : null,
  };
}; 