import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, User, Crown, Baby, Heart, Phone, Calendar } from 'lucide-react';
import { useFamiliaBidirecional } from '@/hooks/useFamiliaBidirecional';

interface PessoaFamiliaProps {
  pessoa: any;
}

export const PessoaFamilia = ({ pessoa }: PessoaFamiliaProps) => {
  const { data: familiaData, isLoading, error } = useFamiliaBidirecional(pessoa.id);

  const getTipoVinculoIcon = (tipo_vinculo: string) => {
    const icons: Record<string, any> = {
      'pai': Crown,
      'mae': Crown,
      'filho': Baby,
      'irmao': Users,
      'conjuge': Heart,
      'atual': User
    };
    const IconComponent = icons[tipo_vinculo] || User;
    return IconComponent;
  };

  const getTipoVinculoBadge = (tipo_vinculo: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      'pai': 'default',
      'mae': 'default', 
      'filho': 'secondary',
      'irmao': 'outline',
      'conjuge': 'default',
      'atual': 'default'
    };
    return variants[tipo_vinculo] || 'outline';
  };

  const getTipoVinculoLabel = (tipo_vinculo: string) => {
    const labels: Record<string, string> = {
      'pai': 'Pai',
      'mae': 'Mãe',
      'filho': 'Filho(a)',
      'irmao': 'Irmão(ã)',
      'conjuge': 'Cônjuge',
      'atual': 'Eu'
    };
    return labels[tipo_vinculo] || 'Familiar';
  };

  const getIdade = (dataNascimento: string) => {
    if (!dataNascimento) return '';
    const idade = new Date().getFullYear() - new Date(dataNascimento).getFullYear();
    return `${idade} anos`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Vínculos Familiares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Vínculos Familiares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Erro ao carregar vínculos familiares.</p>
        </CardContent>
      </Card>
    );
  }

  if (!familiaData?.familiares || familiaData.familiares.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Vínculos Familiares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Esta pessoa não possui vínculos familiares cadastrados.</p>
          <p className="text-sm text-muted-foreground">
            Os vínculos são detectados automaticamente quando pessoas têm os mesmos pais ou filhos em comum.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Vínculos Familiares
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            Vínculos detectados automaticamente baseados nos relacionamentos cadastrados no sistema.
          </div>
          
          <div>
            <div className="space-y-3">
              {familiaData.familiares.map((familiar) => {
                const IconComponent = getTipoVinculoIcon(familiar.tipo_vinculo);
                return (
                  <div key={familiar.pessoa_id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium">{familiar.nome_completo}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={getTipoVinculoBadge(familiar.tipo_vinculo)}>
                              {getTipoVinculoLabel(familiar.tipo_vinculo)}
                            </Badge>
                            {familiar.data_nascimento && (
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {getIdade(familiar.data_nascimento)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            {familiar.telefone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {familiar.telefone}
                              </div>
                            )}
                            {familiar.email && (
                              <span>{familiar.email}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>Como funciona:</strong> Os vínculos familiares aparecem automaticamente quando pessoas compartilham os mesmos pais/mães ou têm filhos em comum. 
              Para adicionar vínculos, edite os campos "Pai" e "Mãe" no cadastro das pessoas.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};