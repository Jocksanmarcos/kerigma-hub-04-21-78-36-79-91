import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreatePessoa, useMissoesPessoas } from '@/hooks/useMissoesPessoas';
import { useChurches } from '@/hooks/useChurches';
import { User, Mail, Phone, MapPin, Building2, Users } from 'lucide-react';

interface ModalCadastrarPessoaProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalCadastrarPessoa: React.FC<ModalCadastrarPessoaProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    telefone: '',
    tipo_pessoa: 'membro',
    church_id: '',
    endereco: '',
    cidade: '',
    estado: '',
    pai_id: '',
    mae_id: '',
  });

  const { data: churches = [] } = useChurches();
  const { data: pessoas = [] } = useMissoesPessoas();
  const createPessoa = useCreatePessoa();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome_completo || !formData.email || !formData.church_id) {
      return;
    }

    try {
      await createPessoa.mutateAsync(formData);
      onClose();
      setFormData({
        nome_completo: '',
        email: '',
        telefone: '',
        tipo_pessoa: 'membro',
        church_id: '',
        endereco: '',
        cidade: '',
        estado: '',
        pai_id: '',
        mae_id: '',
      });
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Cadastrar Nova Pessoa
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome_completo">Nome Completo *</Label>
              <Input
                id="nome_completo"
                value={formData.nome_completo}
                onChange={(e) => handleInputChange('nome_completo', e.target.value)}
                placeholder="Digite o nome completo"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@exemplo.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  placeholder="(99) 99999-9999"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_pessoa">Tipo de Pessoa *</Label>
              <Select value={formData.tipo_pessoa} onValueChange={(value) => handleInputChange('tipo_pessoa', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="membro">Membro</SelectItem>
                  <SelectItem value="visitante">Visitante</SelectItem>
                  <SelectItem value="lider">Líder</SelectItem>
                  <SelectItem value="pastor">Pastor</SelectItem>
                  <SelectItem value="evangelista">Evangelista</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Campos de Genealogia */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-medium text-primary">
              <Users className="h-5 w-5" />
              Informações Familiares (Genealogia)
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pai_id">Pai</Label>
                <Select value={formData.pai_id} onValueChange={(value) => handleInputChange('pai_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar pai (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {pessoas
                      .filter(p => p.genero === 'masculino' || !p.genero)
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
                <Select value={formData.mae_id} onValueChange={(value) => handleInputChange('mae_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar mãe (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhuma</SelectItem>
                    {pessoas
                      .filter(p => p.genero === 'feminino' || !p.genero)
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

          <div className="space-y-2">
            <Label htmlFor="church_id">Igreja/Missão *</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Select value={formData.church_id} onValueChange={(value) => handleInputChange('church_id', value)}>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Selecione a igreja ou missão" />
                </SelectTrigger>
                <SelectContent>
                  {churches.map((church) => (
                    <SelectItem key={church.id} value={church.id}>
                      {church.name} - {church.type === 'sede' ? 'Sede' : 'Missão'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="endereco"
                value={formData.endereco}
                onChange={(e) => handleInputChange('endereco', e.target.value)}
                placeholder="Digite o endereço completo"
                className="pl-10"
                rows={2}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => handleInputChange('cidade', e.target.value)}
                placeholder="Digite a cidade"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                value={formData.estado}
                onChange={(e) => handleInputChange('estado', e.target.value)}
                placeholder="Digite o estado"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createPessoa.isPending}
              className="gap-2"
            >
              {createPessoa.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <User className="h-4 w-4" />
              )}
              Cadastrar Pessoa
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};