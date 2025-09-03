import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Download, Upload, Search, Filter, Video, FileText, Users, Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RecursoCelula {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  categoria: string;
  arquivo_url: string;
  arquivo_nome: string;
  publico_alvo: string[];
  tags: string[];
  downloads: number;
}

async function fetchRecursosCelulas(): Promise<RecursoCelula[]> {
  const { data, error } = await supabase
    .from('biblioteca_recursos_celulas')
    .select('*')
    .eq('ativo', true)
    .order('downloads', { ascending: false });

  if (error) {
    console.error('Erro ao buscar recursos:', error);
    return [];
  }

  return data || [];
}

export const BibliotecaRecursos: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');

  const { data: recursos = [], isLoading, error } = useQuery({
    queryKey: ['recursos-celulas'],
    queryFn: fetchRecursosCelulas,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  if (error) {
    toast.error('Erro ao carregar recursos da biblioteca');
  }

  // Fallback para dados estáticos caso não haja conexão com BD
  const recursosEstaticos: RecursoCelula[] = [
    {
      id: '1',
      titulo: 'O Poder da Oração em Família',
      tipo: 'Estudo Semanal',
      categoria: 'família',
      descricao: 'Estudo completo sobre a importância da oração familiar com dinâmicas práticas',
      downloads: 156,
      arquivo_url: '#',
      arquivo_nome: 'estudo-oracao-familia.pdf',
      publico_alvo: ['Líder', 'Co-líder'],
      tags: ['oração', 'família', 'dinâmica']
    }
  ];

  // Usar dados reais ou fallback para estáticos se não há dados
  const recursosParaUsar = recursos.length > 0 ? recursos : recursosEstaticos;

  const recursosFiltrados = recursosParaUsar.filter(recurso => {
    const filtroTipoOk = filtroTipo === 'todos' || recurso.tipo.toLowerCase().includes(filtroTipo);
    const filtroCategoriaOk = filtroCategoria === 'todas' || recurso.categoria.toLowerCase() === filtroCategoria;
    const filtroBuscaOk = searchTerm === '' || 
      recurso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recurso.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return filtroTipoOk && filtroCategoriaOk && filtroBuscaOk;
  });

  const handleDownload = async (recurso: RecursoCelula) => {
    if (!recurso.arquivo_url) {
      toast.error('Arquivo não disponível para download');
      return;
    }

    try {
      // Incrementar contador de downloads
      const { error } = await supabase
        .from('biblioteca_recursos_celulas')
        .update({ downloads: recurso.downloads + 1 })
        .eq('id', recurso.id);

      if (error) {
        console.error('Erro ao incrementar downloads:', error);
      }

      // Abrir arquivo
      window.open(recurso.arquivo_url, '_blank');
      toast.success(`Download de "${recurso.titulo}" iniciado`);
    } catch (error) {
      toast.error('Erro ao fazer download do arquivo');
    }
  };

  const handleUploadRecurso = () => {
    toast.info('Em desenvolvimento: Upload de novos recursos');
  };

  const getIconByType = (tipo: string) => {
    switch (tipo) {
      case 'Vídeo de Treino':
        return <Video className="h-5 w-5" />;
      case 'Estudo Semanal':
      case 'Devocional':
        return <FileText className="h-5 w-5" />;
      case 'Quebra-Gelo':
        return <Users className="h-5 w-5" />;
      case 'Dinâmica':
        return <Heart className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'Estudo Semanal':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Quebra-Gelo':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Vídeo de Treino':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Dinâmica':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'Devocional':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com Upload */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Biblioteca de Recursos</h2>
          <p className="text-muted-foreground">
            Materiais aprovados para estudos, dinâmicas e treinamentos
          </p>
        </div>
        <Button onClick={handleUploadRecurso}>
          <Upload className="h-4 w-4 mr-2" />
          Enviar Recurso
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar recursos por título ou tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="estudo">Estudo Semanal</SelectItem>
                <SelectItem value="quebra-gelo">Quebra-Gelo</SelectItem>
                <SelectItem value="video">Vídeo de Treino</SelectItem>
                <SelectItem value="dinamica">Dinâmica</SelectItem>
                <SelectItem value="devocional">Devocional</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="familia">Família</SelectItem>
                <SelectItem value="integracao">Integração</SelectItem>
                <SelectItem value="treinamento">Treinamento</SelectItem>
                <SelectItem value="discipulado">Discipulado</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Recursos */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Carregando recursos...</div>
          </div>
        ) : recursosFiltrados.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Nenhum recurso encontrado com os filtros aplicados</div>
          </div>
          ) : (
            recursosFiltrados.map((recurso) => (
          <Card key={recurso.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-muted rounded-lg">
                    {getIconByType(recurso.tipo)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{recurso.titulo}</CardTitle>
                    <CardDescription className="mt-1">
                      {recurso.descricao}
                    </CardDescription>
                    <div className="flex space-x-2 mt-2">
                      <Badge className={getTypeColor(recurso.tipo)}>
                        {recurso.tipo}
                      </Badge>
                      <Badge variant="outline">
                        {recurso.categoria}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    {recurso.downloads} downloads
                  </div>
                  <Button 
                    className="mt-2"
                    onClick={() => handleDownload(recurso)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  <span className="text-sm text-muted-foreground mr-2">Público-alvo:</span>
                  {recurso.publico_alvo.map((publico, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {publico}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {recurso.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>

      {/* Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas da Biblioteca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">45</div>
              <div className="text-sm text-muted-foreground">Total de Recursos</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-green-600">1,234</div>
              <div className="text-sm text-muted-foreground">Downloads Este Mês</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-sm text-muted-foreground">Recursos Novos</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">8</div>
              <div className="text-sm text-muted-foreground">Aguardando Aprovação</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};