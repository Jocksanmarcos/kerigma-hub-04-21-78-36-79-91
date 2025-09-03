import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Gift, Phone, Mail, Cake } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Aniversariante {
  id: string;
  nome_completo: string;
  data_nascimento: string;
  idade: number;
  telefone?: string;
  email?: string;
  dias_para_aniversario: number;
}

export const AniversariantesCard: React.FC = () => {
  const { data: aniversariantes, isLoading } = useQuery({
    queryKey: ['aniversariantes'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_aniversariantes_mes');
      if (error) throw error;
      return data as Aniversariante[];
    }
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getDaysText = (days: number) => {
    if (days === 0) return 'Hoje! 🎉';
    if (days === 1) return 'Amanhã';
    return `${days} dias`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cake className="h-5 w-5 text-primary" />
            Aniversariantes do Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-32" />
                  <div className="h-3 bg-muted rounded w-20 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const aniversariantesHoje = aniversariantes?.filter(a => a.dias_para_aniversario === 0) || [];
  const outrosAniversariantes = aniversariantes?.filter(a => a.dias_para_aniversario > 0) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cake className="h-5 w-5 text-primary" />
          Aniversariantes do Mês
        </CardTitle>
        <CardDescription>
          {aniversariantes?.length || 0} aniversariantes em {format(new Date(), 'MMMM', { locale: ptBR })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {aniversariantesHoje.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-primary flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Hoje
            </h4>
            {aniversariantesHoje.map((pessoa) => (
              <div key={pessoa.id} className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(pessoa.nome_completo)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{pessoa.nome_completo}</p>
                  <p className="text-sm text-muted-foreground">
                    {pessoa.idade} anos • {format(new Date(pessoa.data_nascimento), 'dd/MM', { locale: ptBR })}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="default">🎂 Hoje!</Badge>
                  {pessoa.telefone && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={`tel:${pessoa.telefone}`}>
                        <Phone className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {outrosAniversariantes.length > 0 && (
          <div className="space-y-3">
            {aniversariantesHoje.length > 0 && <hr className="my-4" />}
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Próximos
            </h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {outrosAniversariantes.slice(0, 10).map((pessoa) => (
                <div key={pessoa.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(pessoa.nome_completo)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{pessoa.nome_completo}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(pessoa.data_nascimento), 'dd/MM', { locale: ptBR })} • {pessoa.idade} anos
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {getDaysText(pessoa.dias_para_aniversario)}
                  </Badge>
                </div>
              ))}
            </div>
            {outrosAniversariantes.length > 10 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                E mais {outrosAniversariantes.length - 10} aniversariantes...
              </p>
            )}
          </div>
        )}

        {!aniversariantes?.length && (
          <div className="text-center py-8 text-muted-foreground">
            <Cake className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum aniversariante este mês</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};