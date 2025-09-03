import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface PessoaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  pessoa?: any; // Para edição
}

export const PessoaDialog: React.FC<PessoaDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  pessoa
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!pessoa;

  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    telefone: '',
    tipo_pessoa: 'membro',
    situacao: 'ativo',
    estado_espiritual: 'interessado',
    data_nascimento: '',
    endereco: '',
    observacoes: '',
    profile_id: 'default',
    celula_id: 'default',
    escolaridade: '',
    estado_civil: '',
    pai_id: '',
    mae_id: ''
  });

  // Atualizar formData quando pessoa mudar
  React.useEffect(() => {
    if (pessoa) {
      setFormData({
        nome_completo: pessoa.nome_completo || '',
        email: pessoa.email || '',
        telefone: pessoa.telefone || '',
        tipo_pessoa: pessoa.tipo_pessoa || 'membro',
        situacao: pessoa.situacao || 'ativo',
        estado_espiritual: pessoa.estado_espiritual || 'interessado',
        data_nascimento: pessoa.data_nascimento || '',
        endereco: pessoa.endereco || '',
        observacoes: pessoa.observacoes || '',
        profile_id: pessoa.profile_id || 'default',
        celula_id: pessoa.celula_id || 'default',
        escolaridade: pessoa.escolaridade || '',
        estado_civil: pessoa.estado_civil || '',
        pai_id: pessoa.pai_id || '',
        mae_id: pessoa.mae_id || ''
      });
    } else {
      setFormData({
        nome_completo: '',
        email: '',
        telefone: '',
        tipo_pessoa: 'membro',
        situacao: 'ativo',
        estado_espiritual: 'interessado',
        data_nascimento: '',
        endereco: '',
        observacoes: '',
        profile_id: 'default',
        celula_id: 'default',
        escolaridade: '',
        estado_civil: '',
        pai_id: '',
        mae_id: ''
      });
    }
  }, [pessoa]);

  // Buscar perfis disponíveis
  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('active', true)
        .order('level', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Buscar células disponíveis
  const { data: celulas } = useQuery({
    queryKey: ['celulas-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('celulas')
        .select('id, nome')
        .order('nome', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  // Buscar pessoas para genealogia
  const { data: pessoas } = useQuery({
    queryKey: ['pessoas-genealogia'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pessoas')
        .select('id, nome_completo, genero')
        .eq('situacao', 'ativo')
        .order('nome_completo', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      // Buscar perfil padrão se não foi selecionado um
      let defaultProfileId = data.profile_id;
      if (!defaultProfileId || defaultProfileId === '') {
        const { data: defaultProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('name', 'Membro')
          .eq('active', true)
          .single();
        defaultProfileId = defaultProfile?.id;
      }
      
      const payload = {
        ...data,
        celula_id: data.celula_id === 'sem_celula' || data.celula_id === '' || data.celula_id === 'default' ? null : data.celula_id,
        profile_id: data.profile_id === 'default' || data.profile_id === '' ? defaultProfileId : data.profile_id,
        pai_id: data.pai_id === '' || data.pai_id === 'none' ? null : data.pai_id,
        mae_id: data.mae_id === '' || data.mae_id === 'none' ? null : data.mae_id,
      };
      if (isEditing) {
        const { error } = await supabase
          .from('pessoas')
          .update(payload)
          .eq('id', pessoa.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('pessoas')
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pessoas'] });
      toast({
        title: isEditing ? 'Pessoa atualizada!' : 'Pessoa criada!',
        description: isEditing 
          ? 'Os dados da pessoa foram atualizados com sucesso.'
          : 'Nova pessoa foi adicionada com sucesso.',
      });
      onSuccess();
    },
    onError: (error: any) => {
      let errorMessage = 'Ocorreu um erro ao salvar os dados da pessoa.';
      
      // Verificar se é erro de email duplicado
      if (error?.message?.includes('duplicate key value violates unique constraint "pessoas_email_key"')) {
        errorMessage = 'Este email já está cadastrado no sistema. Cada pessoa deve ter um email único.';
      }
      // Verificar se é erro de foreign key de vínculo familiar
      else if (error?.message?.includes('vinculos_familiares_pessoa_id_fkey')) {
        errorMessage = 'Erro interno ao criar vínculo familiar. Tente novamente.';
      }
      
      toast({
        title: 'Erro ao salvar',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error('Erro:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Pessoa' : 'Adicionar Nova Pessoa'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Atualize as informações da pessoa.'
              : 'Preencha os dados para adicionar uma nova pessoa ao sistema.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome_completo">Nome Completo *</Label>
              <Input
                id="nome_completo"
                value={formData.nome_completo}
                onChange={(e) => handleChange('nome_completo', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">WhatsApp</Label>
              <Input
                id="telefone"
                placeholder="(xx) xxxxx-xxxx"
                value={formData.telefone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  let formatted = value;
                  if (value.length >= 2) {
                    formatted = `(${value.slice(0, 2)}) ${value.slice(2, 7)}`;
                    if (value.length >= 8) {
                      formatted += `-${value.slice(7, 11)}`;
                    }
                  }
                  handleChange('telefone', formatted);
                }}
                maxLength={15}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_nascimento">Data de Nascimento</Label>
              <Input
                id="data_nascimento"
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => handleChange('data_nascimento', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_pessoa">Tipo de Pessoa</Label>
              <Select value={formData.tipo_pessoa} onValueChange={(value) => handleChange('tipo_pessoa', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="membro">Membro</SelectItem>
                  <SelectItem value="visitante">Visitante</SelectItem>
                  <SelectItem value="lider">Líder</SelectItem>
                  <SelectItem value="diacono">Diácono(a)</SelectItem>
                  <SelectItem value="missionario">Missionário(a)</SelectItem>
                  <SelectItem value="pastor">Pastor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="situacao">Situação</Label>
              <Select value={formData.situacao} onValueChange={(value) => handleChange('situacao', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="afastado">Afastado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado_espiritual">Estado Espiritual</Label>
              <Select value={formData.estado_espiritual} onValueChange={(value) => handleChange('estado_espiritual', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interessado">Interessado</SelectItem>
                  <SelectItem value="convertido">Convertido</SelectItem>
                  <SelectItem value="batizado">Batizado</SelectItem>
                  <SelectItem value="membro">Membro</SelectItem>
                  <SelectItem value="lider">Líder</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado_civil">Estado Civil</Label>
              <Select value={formData.estado_civil} onValueChange={(value) => handleChange('estado_civil', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                  <SelectItem value="casado">Casado(a)</SelectItem>
                  <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                  <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                  <SelectItem value="uniao_estavel">União Estável</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="escolaridade">Escolaridade</Label>
              <Select value={formData.escolaridade} onValueChange={(value) => handleChange('escolaridade', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ensino_fundamental_incompleto">Ensino Fundamental Incompleto</SelectItem>
                  <SelectItem value="ensino_fundamental_completo">Ensino Fundamental Completo</SelectItem>
                  <SelectItem value="ensino_medio_incompleto">Ensino Médio Incompleto</SelectItem>
                  <SelectItem value="ensino_medio_completo">Ensino Médio Completo</SelectItem>
                  <SelectItem value="ensino_superior_incompleto">Ensino Superior Incompleto</SelectItem>
                  <SelectItem value="ensino_superior_completo">Ensino Superior Completo</SelectItem>
                  <SelectItem value="pos_graduacao">Pós-graduação</SelectItem>
                  <SelectItem value="mestrado">Mestrado</SelectItem>
                  <SelectItem value="doutorado">Doutorado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Seção de Genealogia */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-primary">Informações Familiares</h3>
              <span className="text-sm text-muted-foreground">(Genealogia)</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pai_id">Pai</Label>
                <Select value={formData.pai_id} onValueChange={(value) => handleChange('pai_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar pai (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {pessoas
                      ?.filter(p => p.genero === 'masculino' && p.id !== pessoa?.id)
                      .map((pessoa) => (
                        <SelectItem key={pessoa.id} value={pessoa.id}>
                          {pessoa.nome_completo}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mae_id">Mãe</Label>
                <Select value={formData.mae_id} onValueChange={(value) => handleChange('mae_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar mãe (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {pessoas
                      ?.filter(p => p.genero === 'feminino' && p.id !== pessoa?.id)
                      .map((pessoa) => (
                        <SelectItem key={pessoa.id} value={pessoa.id}>
                          {pessoa.nome_completo}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile_id">Perfil de Acesso</Label>
              <Select value={formData.profile_id} onValueChange={(value) => handleChange('profile_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Selecione um perfil</SelectItem>
                  {profiles?.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name} (Nível {profile.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="celula_id">Célula</Label>
              <Select value={formData.celula_id} onValueChange={(value) => handleChange('celula_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma célula" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Selecione uma célula</SelectItem>
                  {celulas?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                  <SelectItem value="sem_celula">Sem célula</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => handleChange('endereco', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleChange('observacoes', e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending} aria-label={isEditing ? 'Atualizar pessoa' : 'Criar pessoa'}>
              {mutation.isPending 
                ? (isEditing ? 'Atualizando...' : 'Criando...') 
                : (isEditing ? 'Atualizar' : 'Criar')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
