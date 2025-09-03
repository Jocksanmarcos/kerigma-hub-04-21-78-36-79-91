import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, List, Grid3X3, SortAsc, SortDesc } from 'lucide-react';

interface PessoasFiltersProps {
  filters: {
    search: string;
    situacao: string;
    tipoPessoa: string;
    celulaId: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
  onUpdateFilter: (key: string, value: string) => void;
  onClearFilters: () => void;
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
}

export const PessoasFilters: React.FC<PessoasFiltersProps> = ({
  filters,
  onUpdateFilter,
  onClearFilters,
  viewMode,
  onViewModeChange,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== 'created_at' && value !== 'desc'
  );

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => 
    value !== '' && key !== 'sortBy' && key !== 'sortOrder'
  ).length;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} ativo{activeFiltersCount > 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Seletor de visualização */}
            <div className="flex rounded-lg border p-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>

            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Busca principal */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={filters.search}
            onChange={(e) => onUpdateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros rápidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Select
            value={filters.situacao}
            onValueChange={(value) => onUpdateFilter('situacao', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os Status</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
              <SelectItem value="afastado">Afastado</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.tipoPessoa}
            onValueChange={(value) => onUpdateFilter('tipoPessoa', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipo de Pessoa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os Tipos</SelectItem>
              <SelectItem value="membro">Membro</SelectItem>
              <SelectItem value="visitante">Visitante</SelectItem>
              <SelectItem value="congregado">Congregado</SelectItem>
              <SelectItem value="lider">Líder</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.sortBy}
            onValueChange={(value) => onUpdateFilter('sortBy', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nome_completo">Nome</SelectItem>
              <SelectItem value="created_at">Data de Cadastro</SelectItem>
              <SelectItem value="situacao">Status</SelectItem>
              <SelectItem value="tipo_pessoa">Tipo</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => onUpdateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
            className="justify-start"
          >
            {filters.sortOrder === 'asc' ? (
              <SortAsc className="h-4 w-4 mr-2" />
            ) : (
              <SortDesc className="h-4 w-4 mr-2" />
            )}
            {filters.sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
          </Button>
        </div>

        {/* Filtros avançados */}
        {showAdvanced && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">Filtros Avançados</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                value={filters.celulaId}
                onValueChange={(value) => onUpdateFilter('celulaId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Célula" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as Células</SelectItem>
                  {/* TODO: Carregar células dinamicamente */}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full"
        >
          {showAdvanced ? 'Ocultar' : 'Mostrar'} Filtros Avançados
        </Button>
      </CardContent>
    </Card>
  );
};