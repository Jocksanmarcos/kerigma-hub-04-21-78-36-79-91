import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface PessoasFiltersProps {
  filters: PessoasFilters;
  onFiltersChange: (filters: PessoasFilters) => void;
  onClearFilters: () => void;
}

export interface PessoasFilters {
  termoBusca: string;
  status: string;
  celulaId: string;
  ministerioId: string;
  tipoPessoa: string;
}

interface DropdownOption {
  id: string;
  nome: string;
}

export const PessoasAdvancedFilters: React.FC<PessoasFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const [celulas, setCelulas] = useState<DropdownOption[]>([]);
  const [ministerios, setMinisterios] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      // Carregar células
      const { data: celulasData } = await supabase
        .from('celulas')
        .select('id, nome')
        .eq('ativa', true)
        .order('nome');

      // Carregar ministérios  
      const { data: ministeriosData } = await supabase
        .from('ministerios')
        .select('id, nome')
        .eq('ativo', true)
        .order('nome');

      setCelulas(celulasData || []);
      setMinisterios(ministeriosData || []);
    } catch (error) {
      console.error('Erro ao carregar opções de filtro:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: keyof PessoasFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros de Busca
        </CardTitle>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Limpar
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Campo de Busca Principal */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={filters.termoBusca}
            onChange={(e) => updateFilter('termoBusca', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros Adicionais - Mobile: Coluna única, Desktop: Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            value={filters.status}
            onValueChange={(value) => updateFilter('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-card border shadow-kerigma z-50">
              <SelectItem value="">Todos os Status</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
              <SelectItem value="afastado">Afastado</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.tipoPessoa}
            onValueChange={(value) => updateFilter('tipoPessoa', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipo de Pessoa" />
            </SelectTrigger>
            <SelectContent className="bg-card border shadow-kerigma z-50">
              <SelectItem value="">Todos os Tipos</SelectItem>
              <SelectItem value="membro">Membro</SelectItem>
              <SelectItem value="visitante">Visitante</SelectItem>
              <SelectItem value="congregado">Congregado</SelectItem>
              <SelectItem value="lider">Líder</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.celulaId}
            onValueChange={(value) => updateFilter('celulaId', value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Célula" />
            </SelectTrigger>
            <SelectContent className="bg-card border shadow-kerigma z-50">
              <SelectItem value="">Todas as Células</SelectItem>
              {celulas.map((celula) => (
                <SelectItem key={celula.id} value={celula.id}>
                  {celula.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.ministerioId}
            onValueChange={(value) => updateFilter('ministerioId', value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Ministério" />
            </SelectTrigger>
            <SelectContent className="bg-card border shadow-kerigma z-50">
              <SelectItem value="">Todos os Ministérios</SelectItem>
              {ministerios.map((ministerio) => (
                <SelectItem key={ministerio.id} value={ministerio.id}>
                  {ministerio.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};