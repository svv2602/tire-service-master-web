import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box,
  Chip,
  Typography,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Web as WebIcon,
  Settings as SettingsIcon,
  ContentCopy as ContentIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Импорты UI компонентов
import { PageTable } from '../../components/common/PageTable';
import Notification from '../../components/Notification';
import { getTablePageStyles } from '../../styles';

// Импорты API
import { 
  useGetPageContentsQuery,
  useDeletePageContentMutation,
  useUpdatePageContentMutation
} from '../../api/pageContent.api';

// Типы
interface PageContent {
  id: number;
  title: string;
  section: string;
  content: string;
  content_type: string;
  position: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface PageContentPageProps {}

const PageContentPageNew: React.FC<PageContentPageProps> = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  
  // Состояние для фильтров и поиска
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // API запросы
  const {
    data: pageContentData,
    isLoading,
    error,
    refetch
  } = useGetPageContentsQuery({});
  
  const [deletePage] = useDeletePageContentMutation();
  const [updatePage] = useUpdatePageContentMutation();

  // Константы
  const PER_PAGE = 10;

  // Типы контента с их описаниями
  const getContentTypeInfo = useCallback((contentType: string) => {
    const contentTypes: Record<string, { name: string; icon: string; color: string }> = {
      'hero': { name: 'Главный баннер', icon: '🎯', color: 'primary' },
      'service': { name: 'Услуга', icon: '🔧', color: 'secondary' },
      'city': { name: 'Город', icon: '🏙️', color: 'info' },
      'article': { name: 'Статья', icon: '📝', color: 'success' },
      'cta': { name: 'Призыв к действию', icon: '📢', color: 'warning' },
      'footer': { name: 'Подвал', icon: '📄', color: 'default' }
    };
    
    return contentTypes[contentType] || { 
      name: contentType, 
      icon: '📄', 
      color: 'default' 
    };
  }, []);

  // Получение уникальных типов контента для фильтра
  const contentTypes = useMemo(() => {
    const types = pageContentData?.data?.map(page => page.content_type) || [];
    const uniqueTypes = Array.from(new Set(types));
    return uniqueTypes.map(type => ({
      value: type,
      label: getContentTypeInfo(type).name
    }));
  }, [pageContentData?.data, getContentTypeInfo]);

  // Фильтрация данных
  const filteredData = useMemo(() => {
    let filtered = pageContentData?.data || [];

    // Поиск
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(page =>
        page.title.toLowerCase().includes(query) ||
        page.section.toLowerCase().includes(query) ||
        page.content.toLowerCase().includes(query)
      );
    }

    // Фильтр по статусу
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(page => 
        selectedStatus === 'active' ? page.active : !page.active
      );
    }

    // Фильтр по типу контента
    if (selectedType !== 'all') {
      filtered = filtered.filter(page => page.content_type === selectedType);
    }

    return filtered;
  }, [pageContentData?.data, searchQuery, selectedStatus, selectedType]);

  // Пагинация
  const paginatedData = useMemo(() => {
    const startIndex = page * PER_PAGE;
    return filteredData.slice(startIndex, startIndex + PER_PAGE);
  }, [filteredData, page]);

  const totalItems = filteredData.length;

  // Обработчики событий
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(0);
  }, []);

  const handleStatusFilterChange = useCallback((status: string) => {
    setSelectedStatus(status);
    setPage(0);
  }, []);

  const handleTypeFilterChange = useCallback((type: string) => {
    setSelectedType(type);
    setPage(0);
  }, []);

  const showNotification = useCallback((message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setNotification({ open: true, message, severity });
  }, []);

  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  // Обработка переключения активности
  const handleToggleActive = useCallback(async (pageContent: PageContent) => {
    try {
      await updatePage({
        id: pageContent.id,
        active: !pageContent.active
      }).unwrap();
      
      showNotification(
        `Контент "${pageContent.title}" ${!pageContent.active ? 'активирован' : 'деактивирован'}`,
        'success'
      );
    } catch (error) {
      console.error('Ошибка при изменении активности страницы:', error);
      showNotification('Ошибка при изменении активности контента', 'error');
    }
  }, [updatePage, showNotification]);

  // Обработка удаления
  const handleDelete = useCallback(async (pageContent: PageContent) => {
    try {
      await deletePage(pageContent.id).unwrap();
      showNotification(`Контент "${pageContent.title}" успешно удален`, 'success');
    } catch (error) {
      console.error('Ошибка при удалении страницы:', error);
      showNotification('Ошибка при удалении контента', 'error');
    }
  }, [deletePage, showNotification]);

  // Конфигурация заголовка
  const headerConfig = useMemo(() => ({
    title: 'Управление контентом страниц',
    subtitle: 'Редактирование текстов, настройка услуг и CTA блоков без изменения кода',
    actions: [
      {
        label: 'Создать контент',
        icon: <AddIcon />,
        onClick: () => navigate('/admin/page-content/new'),
        variant: 'contained' as const,
        color: 'primary' as const
      }
    ]
  }), [navigate]);

  // Конфигурация поиска
  const searchConfig = useMemo(() => ({
    placeholder: 'Поиск по заголовку, секции или содержимому...',
    value: searchQuery,
    onChange: handleSearchChange
  }), [searchQuery, handleSearchChange]);

  // Конфигурация фильтров
  const filtersConfig = useMemo(() => [
    {
      id: 'status',
      key: 'status',
      type: 'select' as const,
      label: 'Статус',
      value: selectedStatus,
      onChange: handleStatusFilterChange,
      options: [
        { value: 'all', label: 'Все' },
        { value: 'active', label: 'Активные' },
        { value: 'inactive', label: 'Неактивные' }
      ]
    },
    {
      id: 'type',
      key: 'type',
      type: 'select' as const,
      label: 'Тип контента',
      value: selectedType,
      onChange: handleTypeFilterChange,
      options: [
        { value: 'all', label: 'Все типы' },
        ...contentTypes
      ]
    }
  ], [selectedStatus, selectedType, contentTypes, handleStatusFilterChange, handleTypeFilterChange]);

  // Конфигурация колонок
  const columns = useMemo(() => [
    {
      id: 'content',
      key: 'content' as keyof PageContent,
      label: 'Контент',
      sortable: false,
      render: (pageContent: PageContent) => {
        const contentInfo = getContentTypeInfo(pageContent.content_type);
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                  {contentInfo.icon}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {pageContent.title}
                </Typography>
                <Chip 
                  label={contentInfo.name} 
                  size="small" 
                  color={contentInfo.color as any}
                  variant="outlined"
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Секция: {pageContent.section}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {pageContent.content}
              </Typography>
            </Box>
          </Box>
        );
      }
    },
    {
      id: 'position',
      key: 'position' as keyof PageContent,
      label: 'Позиция',
      sortable: true,
      hideOnMobile: true,
      render: (pageContent: PageContent) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <DragIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {pageContent.position}
          </Typography>
        </Box>
      )
    },
    {
      id: 'active',
      key: 'active' as keyof PageContent,
      label: 'Статус',
      sortable: true,
      render: (pageContent: PageContent) => (
        <Chip 
          label={pageContent.active ? 'Активен' : 'Неактивен'} 
          size="small"
          color={pageContent.active ? 'success' : 'default'}
          icon={pageContent.active ? <VisibilityIcon /> : <VisibilityOffIcon />}
        />
      )
    },
    {
      id: 'created_at',
      key: 'created_at' as keyof PageContent,
      label: 'Дата создания',
      sortable: true,
      hideOnMobile: true,
      render: (pageContent: PageContent) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(pageContent.created_at).toLocaleDateString('ru-RU')}
        </Typography>
      )
    }
  ], [getContentTypeInfo]);

  // Конфигурация действий
  const actionsConfig = useMemo(() => [
    {
      key: 'edit',
      label: 'Редактировать',
      icon: <EditIcon />,
      onClick: (pageContent: PageContent) => navigate(`/admin/page-content/${pageContent.id}/edit`),
      color: 'primary' as const
    },
    {
      key: 'toggle-active',
      label: (pageContent: PageContent) => pageContent.active ? 'Деактивировать' : 'Активировать',
      icon: (pageContent: PageContent) => pageContent.active ? <VisibilityOffIcon /> : <VisibilityIcon />,
      onClick: handleToggleActive,
      color: (pageContent: PageContent) => pageContent.active ? 'warning' as const : 'success' as const
    },
    {
      key: 'delete',
      label: 'Удалить',
      icon: <DeleteIcon />,
      onClick: handleDelete,
      color: 'error' as const,
      confirmationText: 'Вы уверены, что хотите удалить этот контент?'
    }
  ], [navigate, handleToggleActive, handleDelete]);

  return (
    <Box sx={tablePageStyles.pageContainer}>
      <PageTable<PageContent>
        header={headerConfig}
        search={searchConfig}
        filters={filtersConfig}
        columns={columns}
        rows={paginatedData}
        actions={actionsConfig}
        loading={isLoading}
        pagination={{
          page,
          totalItems,
          rowsPerPage: PER_PAGE,
          onPageChange: handlePageChange
        }}
        emptyState={{
          title: searchQuery || selectedStatus !== 'all' || selectedType !== 'all' ? 'Контент не найден' : 'Нет контента',
          description: searchQuery || selectedStatus !== 'all' || selectedType !== 'all'
            ? 'Попробуйте изменить критерии поиска'
            : 'Создайте первый элемент контента для начала работы',
          action: (!searchQuery && selectedStatus === 'all' && selectedType === 'all') ? {
            label: 'Создать контент',
            icon: <AddIcon />,
            onClick: () => navigate('/admin/page-content/new')
          } : undefined
        }}
      />

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </Box>
  );
};

export default PageContentPageNew; 