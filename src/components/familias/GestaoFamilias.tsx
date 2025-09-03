import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Heart, Plus, Users, Search, Link, Unlink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFamiliaBidirecional } from '@/hooks/useFamiliaBidirecional';

interface Familia {
  id: string;
  nome_familia: string;
  endereco?: string;
  telefone_principal?: string;
  created_at: string;
  membros: any[];
}

interface Pessoa {
  id: string;
  nome_completo: string;
  email?: string;
  telefone?: string;
  familia_id?: string;
  foto_url?: string;
}

const GestaoFamilias: React.FC = () => {
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [pessoasSemFamilia, setPessoasSemFamilia] = useState<Pessoa[]>([]);
  const [selectedPessoa, setSelectedPessoa] = useState<string>('');
  const [selectedFamilia, setSelectedFamilia] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadFamilias();
    loadPessoasSemFamilia();
  }, []);

  const loadFamilias = async () => {
    try {
      const { data: familiasData, error } = await supabase
        .from('familias')
        .select(`
          *,
          membros:pessoas!inner(
            id,
            nome_completo,
            email,
            telefone,
            foto_url
          )
        `)
        .order('nome_familia');

      if (error) throw error;

      // Agrupar membros por família
      const familiasProcessadas = familiasData?.reduce((acc: Familia[], familia: any) => {
        const familiaExistente = acc.find(f => f.id === familia.id);
        
        if (familiaExistente) {
          familiaExistente.membros.push(...familia.membros);
        } else {
          acc.push({
            ...familia,
            membros: familia.membros || []
          });
        }
        
        return acc;
      }, []) || [];

      setFamilias(familiasProcessadas);
    } catch (error) {
      console.error('Erro ao carregar famílias:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as famílias.',
        variant: 'destructive',
      });
    }
  };

  const loadPessoasSemFamilia = async () => {
    try {
      const { data, error } = await supabase
        .from('pessoas')
        .select('id, nome_completo, email, telefone, foto_url')
        .is('familia_id', null)
        .eq('situacao', 'ativo')
        .order('nome_completo');

      if (error) throw error;
      setPessoasSemFamilia(data || []);
    } catch (error) {
      console.error('Erro ao carregar pessoas sem família:', error);
    } finally {
      setLoading(false);
    }
  };

  const criarNovaFamilia = async (nomeFamilia: string, pessoaId: string) => {
    try {
      // Criar família
      const { data: novaFamilia, error: familiaError } = await supabase
        .from('familias')
        .insert({ nome_familia: nomeFamilia })
        .select()
        .single();

      if (familiaError) throw familiaError;

      // Vincular pessoa à família
      const { error: updateError } = await supabase
        .from('pessoas')
        .update({ familia_id: novaFamilia.id })
        .eq('id', pessoaId);

      if (updateError) throw updateError;

      toast({
        title: 'Sucesso',
        description: 'Nova família criada com sucesso!',
      });

      // Recarregar dados
      loadFamilias();
      loadPessoasSemFamilia();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar família:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a família.',
        variant: 'destructive',
      });
    }
  };

  const vincularPessoaFamilia = async () => {
    if (!selectedPessoa || !selectedFamilia) {
      toast({
        title: 'Aviso',
        description: 'Selecione uma pessoa e uma família.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('pessoas')
        .update({ familia_id: selectedFamilia })
        .eq('id', selectedPessoa);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Pessoa vinculada à família com sucesso!',
      });

      // Recarregar dados
      loadFamilias();
      loadPessoasSemFamilia();
      setSelectedPessoa('');
      setSelectedFamilia('');
    } catch (error) {
      console.error('Erro ao vincular pessoa:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível vincular a pessoa à família.',
        variant: 'destructive',
      });
    }
  };

  const desvincularPessoa = async (pessoaId: string) => {
    try {
      const { error } = await supabase
        .from('pessoas')
        .update({ familia_id: null })
        .eq('id', pessoaId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Pessoa desvinculada da família.',
      });

      // Recarregar dados
      loadFamilias();
      loadPessoasSemFamilia();
    } catch (error) {
      console.error('Erro ao desvincular pessoa:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível desvincular a pessoa.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar família..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Família
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Família</DialogTitle>
            </DialogHeader>
            <NovaFamiliaForm 
              pessoasSemFamilia={pessoasSemFamilia}
              onSubmit={criarNovaFamilia}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Seção de vinculação rápida */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Vincular Pessoa à Família
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedPessoa} onValueChange={setSelectedPessoa}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar pessoa" />
              </SelectTrigger>
              <SelectContent>
                {pessoasSemFamilia.map((pessoa) => (
                  <SelectItem key={pessoa.id} value={pessoa.id}>
                    {pessoa.nome_completo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedFamilia} onValueChange={setSelectedFamilia}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar família" />
              </SelectTrigger>
              <SelectContent>
                {familias.map((familia) => (
                  <SelectItem key={familia.id} value={familia.id}>
                    {familia.nome_familia}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={vincularPessoaFamilia} disabled={!selectedPessoa || !selectedFamilia}>
              <Link className="h-4 w-4 mr-2" />
              Vincular
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de famílias */}
      <div className="space-y-4">
        {familias.length === 0 ? (
          <Card className="p-8 text-center">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma família cadastrada</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando uma nova família para organizar os membros
            </p>
          </Card>
        ) : (
          familias
            .filter(familia => 
              familia.nome_familia.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((familia) => (
              <FamiliaCard
                key={familia.id}
                familia={familia}
                onDesvincular={desvincularPessoa}
              />
            ))
        )}
      </div>

      {/* Pessoas sem família */}
      {pessoasSemFamilia.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Pessoas sem Família ({pessoasSemFamilia.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {pessoasSemFamilia.map((pessoa) => (
                <div key={pessoa.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={pessoa.foto_url} alt={pessoa.nome_completo} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {pessoa.nome_completo.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{pessoa.nome_completo}</p>
                    <p className="text-xs text-muted-foreground truncate">{pessoa.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Componente para card da família
interface FamiliaCardProps {
  familia: Familia;
  onDesvincular: (pessoaId: string) => void;
}

const FamiliaCard: React.FC<FamiliaCardProps> = ({ familia, onDesvincular }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            {familia.nome_familia}
          </CardTitle>
          <Badge variant="outline">
            {familia.membros.length} membro{familia.membros.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {familia.endereco && (
            <p className="text-sm text-muted-foreground">{familia.endereco}</p>
          )}
          
          <div className="grid gap-3">
            {familia.membros.map((membro) => (
              <div key={membro.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={membro.foto_url} alt={membro.nome_completo} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {membro.nome_completo.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{membro.nome_completo}</p>
                    <p className="text-sm text-muted-foreground">{membro.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDesvincular(membro.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Unlink className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Formulário para nova família
interface NovaFamiliaFormProps {
  pessoasSemFamilia: Pessoa[];
  onSubmit: (nomeFamilia: string, pessoaId: string) => void;
}

const NovaFamiliaForm: React.FC<NovaFamiliaFormProps> = ({ pessoasSemFamilia, onSubmit }) => {
  const [nomeFamilia, setNomeFamilia] = useState('');
  const [pessoaId, setPessoaId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nomeFamilia && pessoaId) {
      onSubmit(nomeFamilia, pessoaId);
      setNomeFamilia('');
      setPessoaId('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Nome da Família</label>
        <Input
          value={nomeFamilia}
          onChange={(e) => setNomeFamilia(e.target.value)}
          placeholder="Digite o nome da família"
          required
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Primeiro Membro</label>
        <Select value={pessoaId} onValueChange={setPessoaId} required>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma pessoa" />
          </SelectTrigger>
          <SelectContent>
            {pessoasSemFamilia.map((pessoa) => (
              <SelectItem key={pessoa.id} value={pessoa.id}>
                {pessoa.nome_completo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Criar Família
      </Button>
    </form>
  );
};

export default GestaoFamilias;