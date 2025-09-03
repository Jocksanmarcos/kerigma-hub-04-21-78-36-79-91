import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Gift, Phone, Mail, Cake, PartyPopper } from 'lucide-react';
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

export const AniversariantesCardV2: React.FC = () => {
  const { data: aniversariantes, isLoading } = useQuery({
    queryKey: ['aniversariantes-v2'],
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
    if (days === 0) return 'Hoje!';
    if (days === 1) return 'Amanhã';
    return `${days} dias`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse flex items-center gap-3">
              <div className="h-12 w-12 bg-muted rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-32 mb-2" />
                <div className="h-3 bg-muted rounded w-20" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const aniversariantesHoje = aniversariantes?.filter(a => a.dias_para_aniversario === 0) || [];
  const proximosAniversariantes = aniversariantes?.filter(a => a.dias_para_aniversario > 0).slice(0, 20) || [];

  return (
    <div className="space-y-4">
      {/* Header com estatísticas */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-full">
                <Cake className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Aniversariantes</h2>
                <p className="text-sm text-muted-foreground">
                  {aniversariantes?.length || 0} em {format(new Date(), 'MMMM', { locale: ptBR })}
                </p>
              </div>
            </div>
            {aniversariantesHoje.length > 0 && (
              <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">
                <PartyPopper className="h-3 w-3 mr-1" />
                {aniversariantesHoje.length} hoje!
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Aniversariantes de hoje - Destaque especial */}
      {aniversariantesHoje.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-primary">Comemorando Hoje! 🎉</h3>
          </div>
          
          {aniversariantesHoje.map((pessoa) => (
            <Card key={pessoa.id} className="p-4 bg-primary/5 border-primary/20 shadow-md">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-primary/30">
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {getInitials(pessoa.nome_completo)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{pessoa.nome_completo}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Calendar className="h-4 w-4" />
                    <span>{pessoa.idade} anos • {format(new Date(pessoa.data_nascimento), 'dd/MM', { locale: ptBR })}</span>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    {pessoa.telefone && (
                      <Button size="sm" variant="outline" asChild className="h-8">
                        <a href={`tel:${pessoa.telefone}`}>
                          <Phone className="h-3 w-3 mr-1" />
                          Ligar
                        </a>
                      </Button>
                    )}
                    {pessoa.email && (
                      <Button size="sm" variant="outline" asChild className="h-8">
                        <a href={`mailto:${pessoa.email}`}>
                          <Mail className="h-3 w-3 mr-1" />
                          Email
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl mb-1">🎂</div>
                  <Badge variant="default" className="text-xs">
                    Hoje!
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Próximos aniversariantes */}
      {proximosAniversariantes.length > 0 && (
        <div className="space-y-3">
          {aniversariantesHoje.length > 0 && (
            <div className="flex items-center gap-2 mt-6">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Próximos Aniversários</h3>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-2">
            {proximosAniversariantes.map((pessoa) => (
              <Card key={pessoa.id} className="p-3 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-sm">
                      {getInitials(pessoa.nome_completo)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{pessoa.nome_completo}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{format(new Date(pessoa.data_nascimento), 'dd/MM', { locale: ptBR })}</span>
                      <span>•</span>
                      <span>{pessoa.idade} anos</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        pessoa.dias_para_aniversario <= 7 
                          ? 'border-orange-300 text-orange-600 bg-orange-50' 
                          : 'border-muted-foreground/30'
                      }`}
                    >
                      {getDaysText(pessoa.dias_para_aniversario)}
                    </Badge>
                    
                    {pessoa.telefone && (
                      <Button size="sm" variant="ghost" asChild className="h-8 w-8 p-0">
                        <a href={`tel:${pessoa.telefone}`}>
                          <Phone className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {aniversariantes && aniversariantes.length > proximosAniversariantes.length + aniversariantesHoje.length && (
            <Card className="p-3">
              <p className="text-center text-sm text-muted-foreground">
                E mais {aniversariantes.length - proximosAniversariantes.length - aniversariantesHoje.length} aniversariantes este mês...
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Estado vazio */}
      {!aniversariantes?.length && !isLoading && (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            <Cake className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nenhum aniversariante</h3>
            <p className="text-sm">Não há aniversários registrados para este mês.</p>
          </div>
        </Card>
      )}
    </div>
  );
};