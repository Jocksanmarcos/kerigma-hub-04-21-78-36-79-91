import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '@/hooks/use-debounce';

interface PessoasFilters {
  search: string;
  situacao: string;
  tipoPessoa: string;
  celulaId: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const usePessoasFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filters, setFilters] = useState<PessoasFilters>({
    search: searchParams.get('search') || '',
    situacao: searchParams.get('situacao') || '',
    tipoPessoa: searchParams.get('tipoPessoa') || '',
    celulaId: searchParams.get('celulaId') || '',
    sortBy: searchParams.get('sortBy') || 'created_at',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  });

  // Debounce para busca de texto
  const debouncedSearch = useDebounce(filters.search, 300);

  // Filtros finais com debounce aplicado
  const finalFilters = useMemo(() => ({
    ...filters,
    search: debouncedSearch,
  }), [filters, debouncedSearch]);

  const updateFilter = (key: keyof PessoasFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Atualizar URL
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) newSearchParams.set(k, v);
    });
    setSearchParams(newSearchParams);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      situacao: '',
      tipoPessoa: '',
      celulaId: '',
      sortBy: 'created_at',
      sortOrder: 'desc' as const,
    };
    setFilters(clearedFilters);
    setSearchParams({});
  };

  return {
    filters: finalFilters,
    updateFilter,
    clearFilters,
  };
};