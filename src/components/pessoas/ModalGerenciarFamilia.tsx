import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Home, Users, Plus, Trash2, UserCheck } from 'lucide-react';

interface ModalGerenciarFamiliaProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Pessoa {
  id: string;
  nome_completo: string;
  email: string;
}

interface VinculoFamiliar {
  id?: string;
  pessoa_id: string;
  tipo_vinculo: string;
  responsavel_familiar: boolean;
  pessoa?: Pessoa;
}

export const ModalGerenciarFamilia: React.FC<ModalGerenciarFamiliaProps> = ({
  isOpen,
  onClose,
}) => {
  const [familiaData, setFamiliaData] = useState({
    nome_familia: '',
    endereco: '',
    telefone_principal: '',
    observacoes: '',
  });
  
  const [vinculos, setVinculos] = useState<VinculoFamiliar[]>([]);
  const [pessoaSelecionada, setPessoaSelecionada] = useState('');
  const [tipoVinculo, setTipoVinculo] = useState('');
  const [responsavelFamiliar, setResponsavelFamiliar] = useState(false);

  const queryClient = useQueryClient();

  // Buscar pessoas disponíveis
  const { data: pessoas = [] } = useQuery({
    queryKey: ['pessoas-sem-familia'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pessoas')
        .select('id, nome_completo, email')
        .eq('situacao', 'ativo')
        .order('nome_completo');

      if (error) throw error;
      return data;
    },
    enabled: isOpen
  });

  // Criar família e vínculos
  const criarFamilia = useMutation({
    mutationFn: async () => {
      if (!familiaData.nome_familia.trim()) {
        throw new Error('Nome da família é obrigatório');
      }
      
      if (vinculos.length === 0) {
        throw new Error('Adicione pelo menos um membro à família');
      }

      // Criar família
      const { data: familia, error: familiaError } = await supabase
        .from('familias')
        .insert([familiaData])
        .select()
        .single();

      if (familiaError) throw familiaError;

      // Criar vínculos
      const vinculosData = vinculos.map(vinculo => ({
        familia_id: familia.id,
        pessoa_id: vinculo.pessoa_id,
        tipo_vinculo: vinculo.tipo_vinculo,
        responsavel_familiar: vinculo.responsavel_familiar
      }));

      const { error: vinculosError } = await supabase
        .from('vinculos_familiares')
        .insert(vinculosData);

      if (vinculosError) throw vinculosError;

      // Atualizar familia_id nas pessoas
      const pessoasIds = vinculos.map(v => v.pessoa_id);
      const { error: updateError } = await supabase
        .from('pessoas')
        .update({ familia_id: familia.id })
        .in('id', pessoasIds);

      if (updateError) throw updateError;

      return familia;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familias-tree'] });
      queryClient.invalidateQueries({ queryKey: ['missoes-pessoas'] });
      toast.success('Família criada com sucesso!');
      onClose();
      resetForm();
    },
    onError: (error) => {
      console.error('Erro ao criar família:', error);
      toast.error(error.message || 'Erro ao criar família');
    }
  });

  const adicionarVinculo = () => {
    if (!pessoaSelecionada || !tipoVinculo) {
      toast.error('Selecione uma pessoa e o tipo de vínculo');
      return;
    }

    const pessoa = pessoas.find(p => p.id === pessoaSelecionada);
    if (!pessoa) return;

    // Verificar se a pessoa já foi adicionada
    if (vinculos.find(v => v.pessoa_id === pessoaSelecionada)) {
      toast.error('Esta pessoa já foi adicionada à família');
      return;
    }

    setVinculos(prev => [...prev, {
      pessoa_id: pessoaSelecionada,
      tipo_vinculo: tipoVinculo,
      responsavel_familiar: responsavelFamiliar,
      pessoa
    }]);

    // Limpar seleção
    setPessoaSelecionada('');
    setTipoVinculo('');
    setResponsavelFamiliar(false);
  };

  const removerVinculo = (pessoaId: string) => {
    setVinculos(prev => prev.filter(v => v.pessoa_id !== pessoaId));
  };

  const resetForm = () => {
    setFamiliaData({
      nome_familia: '',
      endereco: '',
      telefone_principal: '',
      observacoes: '',
    });
    setVinculos([]);
    setPessoaSelecionada('');
    setTipoVinculo('');
    setResponsavelFamiliar(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const tiposVinculo = [
    { value: 'pai', label: 'Pai' },
    { value: 'mae', label: 'Mãe' },
    { value: 'filho', label: 'Filho' },
    { value: 'filha', label: 'Filha' },
    { value: 'avô', label: 'Avô' },
    { value: 'avó', label: 'Avó' },
    { value: 'neto', label: 'Neto' },
    { value: 'neta', label: 'Neta' },
    { value: 'irmão', label: 'Irmão' },
    { value: 'irmã', label: 'Irmã' },
    { value: 'outro', label: 'Outro' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            Criar Nova Família
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Dados da Família */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações da Família</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome_familia">Nome da Família *</Label>
                <Input
                  id="nome_familia"
                  value={familiaData.nome_familia}
                  onChange={(e) => setFamiliaData(prev => ({ ...prev, nome_familia: e.target.value }))}
                  placeholder="Ex: Família Barros"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefone_principal">Telefone Principal</Label>
                <Input
                  id="telefone_principal"
                  value={familiaData.telefone_principal}
                  onChange={(e) => setFamiliaData(prev => ({ ...prev, telefone_principal: e.target.value }))}
                  placeholder="(99) 99999-9999"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Textarea
                id="endereco"
                value={familiaData.endereco}
                onChange={(e) => setFamiliaData(prev => ({ ...prev, endereco: e.target.value }))}
                placeholder="Endereço completo da família"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={familiaData.observacoes}
                onChange={(e) => setFamiliaData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Informações adicionais sobre a família"
                rows={2}
              />
            </div>
          </div>

          {/* Adicionar Membros */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Membros da Família</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="space-y-2">
                <Label>Pessoa</Label>
                <Select value={pessoaSelecionada} onValueChange={setPessoaSelecionada}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar pessoa" />
                  </SelectTrigger>
                  <SelectContent>
                    {pessoas
                      .filter(p => !vinculos.find(v => v.pessoa_id === p.id))
                      .map((pessoa) => (
                        <SelectItem key={pessoa.id} value={pessoa.id}>
                          {pessoa.nome_completo}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Vínculo</Label>
                <Select value={tipoVinculo} onValueChange={setTipoVinculo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar vínculo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposVinculo.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Responsável</Label>
                <Select 
                  value={responsavelFamiliar ? 'sim' : 'nao'} 
                  onValueChange={(value) => setResponsavelFamiliar(value === 'sim')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nao">Não</SelectItem>
                    <SelectItem value="sim">Sim</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  type="button" 
                  onClick={adicionarVinculo}
                  className="w-full gap-2"
                  disabled={!pessoaSelecionada || !tipoVinculo}
                >
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            </div>

            {/* Lista de Membros Adicionados */}
            {vinculos.length > 0 && (
              <div className="space-y-2">
                <Label>Membros Adicionados:</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                  {vinculos.map((vinculo) => (
                    <div key={vinculo.pessoa_id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{vinculo.pessoa?.nome_completo}</span>
                        <Badge variant="outline">{tiposVinculo.find(t => t.value === vinculo.tipo_vinculo)?.label}</Badge>
                        {vinculo.responsavel_familiar && (
                          <Badge variant="secondary">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Responsável
                          </Badge>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removerVinculo(vinculo.pessoa_id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              onClick={() => criarFamilia.mutate()}
              disabled={criarFamilia.isPending || !familiaData.nome_familia || vinculos.length === 0}
              className="gap-2"
            >
              {criarFamilia.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <Home className="h-4 w-4" />
              )}
              Criar Família
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};