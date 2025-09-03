import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, 
  Lock, 
  Plus, 
  Edit, 
  Save, 
  X,
  Clock,
  User,
  AlertCircle
} from 'lucide-react';

interface PessoaNotasConfidenciaisProps {
  pessoa: any;
}

interface NotaPastoral {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  categoria: string;
  criado_por_nome?: string;
}

export const PessoaNotasConfidenciais: React.FC<PessoaNotasConfidenciaisProps> = ({ pessoa }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [newCategory, setNewCategory] = useState('pastoral');
  const [editContent, setEditContent] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Simular busca de notas pastorais (esta tabela precisaria ser criada no banco)
  const { data: notes, isLoading } = useQuery({
    queryKey: ['notas-pastorais', pessoa.id],
    queryFn: async () => {
      // Como a tabela de notas pastorais não existe, vamos simular com dados do campo observacoes
      const mock: NotaPastoral[] = [];
      
      if (pessoa.observacoes) {
        mock.push({
          id: 'obs-inicial',
          content: pessoa.observacoes,
          created_at: pessoa.created_at,
          created_by: 'sistema',
          categoria: 'observacao',
          criado_por_nome: 'Sistema'
        });
      }

      return mock;
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: async (noteData: { content: string; categoria: string }) => {
      // Para demo, vamos atualizar as observações da pessoa
      const currentObs = pessoa.observacoes || '';
      const timestamp = new Date().toLocaleString();
      const newObservations = currentObs + `\n\n[${timestamp}] ${noteData.content}`;
      
      const { error } = await supabase
        .from('pessoas')
        .update({ observacoes: newObservations })
        .eq('id', pessoa.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pessoa', pessoa.id] });
      queryClient.invalidateQueries({ queryKey: ['notas-pastorais', pessoa.id] });
      setIsAdding(false);
      setNewNote('');
      toast({
        title: 'Nota adicionada!',
        description: 'A nota pastoral foi salva com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao salvar nota',
        description: 'Ocorreu um erro ao salvar a nota pastoral.',
        variant: 'destructive',
      });
      console.error('Erro:', error);
    }
  });

  const handleAddNote = () => {
    if (newNote.trim()) {
      addNoteMutation.mutate({
        content: newNote.trim(),
        categoria: newCategory
      });
    }
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewNote('');
  };

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'pastoral': return 'bg-blue-100 text-blue-800';
      case 'aconselhamento': return 'bg-green-100 text-green-800';
      case 'disciplina': return 'bg-red-100 text-red-800';
      case 'observacao': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case 'pastoral': return <Heart className="h-4 w-4" />;
      case 'aconselhamento': return <User className="h-4 w-4" />;
      case 'disciplina': return <AlertCircle className="h-4 w-4" />;
      case 'observacao': return <Clock className="h-4 w-4" />;
      default: return <Heart className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Heart className="h-6 w-6" />
            <span>Notas Confidenciais</span>
          </h2>
          <p className="text-muted-foreground">
            Anotações pastorais privadas e confidenciais
          </p>
        </div>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Nota
        </Button>
      </div>

      {/* Aviso de Confidencialidade */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-yellow-600" />
            <div>
              <h4 className="font-medium text-yellow-800">Informação Confidencial</h4>
              <p className="text-sm text-yellow-700">
                As notas pastorais são confidenciais e só devem ser acessadas por líderes autorizados.
                Use este espaço para registrar informações sensíveis sobre o cuidado pastoral.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Nova Nota */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Nova Nota</CardTitle>
            <CardDescription>
              Registre informações pastorais importantes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <select 
                value={newCategory} 
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="pastoral">Cuidado Pastoral</option>
                <option value="aconselhamento">Aconselhamento</option>
                <option value="disciplina">Disciplina/Restauração</option>
                <option value="observacao">Observação Geral</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Conteúdo da Nota</label>
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Digite aqui suas observações pastorais..."
                rows={4}
              />
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={handleAddNote} 
                disabled={!newNote.trim() || addNoteMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {addNoteMutation.isPending ? 'Salvando...' : 'Salvar Nota'}
              </Button>
              <Button variant="outline" onClick={handleCancelAdd}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Notas */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Carregando notas...</p>
            </CardContent>
          </Card>
        ) : notes && notes.length > 0 ? (
          notes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={getCategoryColor(note.categoria)}>
                      <div className="flex items-center space-x-1">
                        {getCategoryIcon(note.categoria)}
                        <span>{note.categoria}</span>
                      </div>
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      por {note.criado_por_nome}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {new Date(note.created_at).toLocaleString()}
                    </span>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingNote === note.id ? (
                  <div className="space-y-4">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={4}
                    />
                    <div className="flex space-x-2">
                      <Button size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingNote(null);
                          setEditContent('');
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap text-sm">
                    {note.content}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma nota pastoral</h3>
              <p className="text-muted-foreground">
                Adicione notas para acompanhar o cuidado pastoral desta pessoa.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};