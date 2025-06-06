import React from 'react';
import { useParams } from 'react-router-dom';
import { useArticle } from '../../hooks/useArticles';
import ArticleForm from '../../components/articles/ArticleForm';

const EditArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { article, loading, error } = useArticle(id || null);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Загрузка статьи...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="text-red-600 mb-2">❌ Ошибка</div>
          <p className="text-gray-600">
            {error || 'Статья не найдена'}
          </p>
          <a
            href="/articles"
            className="inline-block mt-4 text-blue-600 hover:text-blue-700"
          >
            ← Вернуться к списку статей
          </a>
        </div>
      </div>
    );
  }

  return <ArticleForm mode="edit" article={article} />;
};

export default EditArticlePage; 