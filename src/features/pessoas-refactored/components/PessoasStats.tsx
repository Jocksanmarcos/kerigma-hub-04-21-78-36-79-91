import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, UserX, Crown, UserPlus } from 'lucide-react';

interface PessoasStatsProps {
  stats: {
    total: number;
    ativos: number;
    inativos: number;
    membros: number;
    visitantes: number;
    lideres: number;
  } | null;
  isLoading: boolean;
}

export const PessoasStats: React.FC<PessoasStatsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-8 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statsData = [
    {
      label: 'Total',
      value: stats.total,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Ativos',
      value: stats.ativos,
      icon: UserCheck,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Inativos',
      value: stats.inativos,
      icon: UserX,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/20',
    },
    {
      label: 'Membros',
      value: stats.membros,
      icon: Users,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      label: 'Visitantes',
      value: stats.visitantes,
      icon: UserPlus,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Líderes',
      value: stats.lideres,
      icon: Crown,
      color: 'text-kerigma',
      bgColor: 'bg-kerigma-gradient/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="hover:shadow-kerigma-sm transition-all">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};