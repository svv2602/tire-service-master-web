import { useState, useCallback, useEffect } from 'react';
import { 
  useSearchSupplierProductsGroupedMutation,
  useGetSupplierProductsFiltersQuery,
  SupplierProductSearchParams,
  TireGroup,
  SearchFilters
} from '../api/supplierProducts.api';

interface UseSupplierProductsSearchOptions {
  autoSearch?: boolean;
  enableFilters?: boolean;
}

interface UseSupplierProductsSearchReturn {
  // Состояние поиска
  groups: TireGroup[];
  loading: boolean;
  error: string | null;
  
  // Фильтры
  filters: SearchFilters | undefined;
  filtersLoading: boolean;
  
  // Функции поиска
  searchProducts: (params: SupplierProductSearchParams) => Promise<void>;
  clearResults: () => void;
  
  // Статистика
  totalGroups: number;
  totalProducts: number;
  showAllOffers: boolean;
}

export const useSupplierProductsSearch = (
  options: UseSupplierProductsSearchOptions = {}
): UseSupplierProductsSearchReturn => {
  const { autoSearch = false, enableFilters = true } = options;
  
  // Состояние
  const [groups, setGroups] = useState<TireGroup[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [totalGroups, setTotalGroups] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showAllOffers, setShowAllOffers] = useState(true);
  
  // API хуки
  const [searchMutation, { isLoading: searchLoading }] = useSearchSupplierProductsGroupedMutation();
  const { 
    data: filters, 
    isLoading: filtersLoading 
  } = useGetSupplierProductsFiltersQuery(undefined, {
    skip: !enableFilters
  });
  
  // Функция поиска
  const searchProducts = useCallback(async (params: SupplierProductSearchParams) => {
    try {
      setError(null);
      
      const result = await searchMutation(params).unwrap();
      
      if (result.success) {
        setGroups(result.groups);
        setTotalGroups(result.total_groups);
        setTotalProducts(result.total_products);
        setShowAllOffers(result.show_all_offers);
      } else {
        setError('Ошибка при поиске товаров поставщиков');
        setGroups([]);
        setTotalGroups(0);
        setTotalProducts(0);
      }
    } catch (err: any) {
      console.error('Supplier products search error:', err);
      setError(err?.data?.error || 'Произошла ошибка при поиске товаров');
      setGroups([]);
      setTotalGroups(0);
      setTotalProducts(0);
    }
  }, [searchMutation]);
  
  // Очистка результатов
  const clearResults = useCallback(() => {
    setGroups([]);
    setError(null);
    setTotalGroups(0);
    setTotalProducts(0);
  }, []);
  
  return {
    groups,
    loading: searchLoading,
    error,
    
    filters,
    filtersLoading,
    
    searchProducts,
    clearResults,
    
    totalGroups,
    totalProducts,
    showAllOffers,
  };
};