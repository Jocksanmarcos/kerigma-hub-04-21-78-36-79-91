import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Users } from 'lucide-react';

interface FamilyStatsCardProps {
  onViewFamilies: () => void;
}

export const FamilyStatsCard: React.FC<FamilyStatsCardProps> = ({ onViewFamilies }) => {
  const { data: familiaStats } = useQuery({
    queryKey: ['familia-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('obter_estatisticas_familias');
      if (error) throw error;
      return data?.[0] || {
        total_familias: 0,
        familias_com_criancas: 0,
        familias_monoparentais: 0,
        media_membros_por_familia: 0
      };
    }
  });

  return (
    <Card className="hover:shadow-kerigma transition-shadow duration-200 cursor-pointer" onClick={onViewFamilies}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Total de Famílias
        </CardTitle>
        <Home className="h-4 w-4 text-green-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{familiaStats?.total_familias || 0}</div>
        <div className="space-y-1 mt-2">
          <p className="text-xs text-muted-foreground">
            {familiaStats?.familias_com_criancas || 0} com crianças
          </p>
          <p className="text-xs text-muted-foreground">
            {familiaStats?.familias_monoparentais || 0} monoparentais
          </p>
          <p className="text-xs text-muted-foreground">
            Média: {Number(familiaStats?.media_membros_por_familia || 0).toFixed(1)} membros/família
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-3 text-primary hover:text-primary"
          onClick={(e) => {
            e.stopPropagation();
            onViewFamilies();
          }}
        >
          <Users className="h-4 w-4 mr-2" />
          Ver Árvore Genealógica
        </Button>
      </CardContent>
    </Card>
  );
};