import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Users, Home, TrendingUp, Calendar, MapPin, Phone, Mail, Building2 } from 'lucide-react';
import { useChurches } from '@/hooks/useChurches';
import { useChurchContext } from '@/contexts/ChurchContext';
import { useNewUserRole } from '@/hooks/useNewRole';
import { ResponsiveDashboardGrid } from '@/components/ui/responsive-dashboard-grid';
import { MissoesLayout } from '@/components/missoes/MissoesLayout';
import { ModalCadastrarIgreja } from '@/components/missoes/modals/ModalCadastrarIgreja';

interface MissionStats {
  membros_ativos: number;
  celulas_ativas: number;
  entradas_mes: number;
  eventos_mes: number;
}

// Mock data for demonstration - in real app this would come from API
const getMissionStats = (churchId: string): MissionStats => ({
  membros_ativos: Math.floor(Math.random() * 200) + 50,
  celulas_ativas: Math.floor(Math.random() * 15) + 3,
  entradas_mes: Math.floor(Math.random() * 5000) + 1000,
  eventos_mes: Math.floor(Math.random() * 8) + 2,
});

const MissionCard: React.FC<{ church: any }> = ({ church }) => {
  const stats = getMissionStats(church.id);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-border/50 bg-gradient-to-br from-background to-background/80">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold text-primary">{church.name}</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{church.cidade}, {church.estado}</span>
            </div>
          </div>
          <Badge variant={church.type === 'sede' ? 'default' : 'secondary'}>
            {church.type === 'sede' ? 'Sede' : 'Missão'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estatísticas principais */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Membros</span>
            </div>
            <div className="text-2xl font-bold text-primary">{stats.membros_ativos}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Home className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Células</span>
            </div>
            <div className="text-2xl font-bold text-primary">{stats.celulas_ativas}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Entradas</span>
            </div>
            <div className="text-2xl font-bold text-success">
              R$ {stats.entradas_mes.toLocaleString()}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Eventos</span>
            </div>
            <div className="text-2xl font-bold text-primary">{stats.eventos_mes}</div>
          </div>
        </div>

        {/* Informações de contato */}
        {(church.email || church.telefone) && (
          <div className="pt-2 border-t border-border/50 space-y-2">
            {church.email && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{church.email}</span>
              </div>
            )}
            {church.telefone && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{church.telefone}</span>
              </div>
            )}
          </div>
        )}

        {/* Pastor responsável */}
        {church.pastor_responsavel && (
          <div className="pt-2 border-t border-border/50">
            <div className="text-sm text-muted-foreground">Pastor Responsável</div>
            <div className="font-medium text-foreground">{church.pastor_responsavel}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const Missoes: React.FC = () => {
  const { data: churches = [], isLoading } = useChurches();
  const { isSuperAdmin } = useChurchContext();
  const { data: userRole, isLoading: roleLoading } = useNewUserRole();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalInitialType, setModalInitialType] = useState<'sede' | 'missao'>('sede');
  const [modalLockType, setModalLockType] = useState(false);

  // Permitir acesso a pastores, líderes e super admins
  const hasAccess = isSuperAdmin || userRole === 'pastor' || userRole === 'lider';
  const canCreateChurch = isSuperAdmin || userRole === 'pastor';

  if (roleLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-muted-foreground">Acesso Restrito</h2>
          <p className="text-muted-foreground">
            Apenas pastores e líderes podem acessar o dashboard de missões.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-primary">Dashboard de Missões</h1>
            <p className="text-muted-foreground">
              Visão geral de todas as igrejas e missões da rede
            </p>
          </div>
        </div>
        <ResponsiveDashboardGrid variant="pastor">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </ResponsiveDashboardGrid>
      </div>
    );
  }

  const sedeChurches = churches.filter(church => church.type === 'sede');
  const missaoChurches = churches.filter(church => church.type === 'missao');

  const handleNovaIgreja = (tipo: 'sede' | 'missao', lockType: boolean = false) => {
    setModalInitialType(tipo);
    setModalLockType(lockType);
    setShowCreateModal(true);
  };

  return (
    <MissoesLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-primary">Dashboard de Missões</h1>
          <p className="text-muted-foreground">
            Visão geral de todas as igrejas e missões da rede CBN Kerigma
          </p>
        </div>
        {canCreateChurch && (
          <Button 
            className="gap-2"
            onClick={() => handleNovaIgreja('missao')}
            disabled={sedeChurches.length === 0}
          >
            <Plus className="h-4 w-4" />
            Nova Missão
          </Button>
        )}
      </div>

      {/* Resumo geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold text-primary">{churches.length}</div>
                <div className="text-sm text-muted-foreground">Total de Igrejas</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Home className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold text-primary">{sedeChurches.length}</div>
                <div className="text-sm text-muted-foreground">Igrejas Sede</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold text-primary">{missaoChurches.length}</div>
                <div className="text-sm text-muted-foreground">Missões</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-success" />
              <div>
                <div className="text-2xl font-bold text-success">
                  {churches.reduce((acc, church) => acc + getMissionStats(church.id).membros_ativos, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total de Membros</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Igrejas Sede */}
      {sedeChurches.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Home className="h-6 w-6" />
            Igrejas Sede
          </h2>
          <ResponsiveDashboardGrid variant="pastor">
            {sedeChurches.map((church) => (
              <MissionCard key={church.id} church={church} />
            ))}
          </ResponsiveDashboardGrid>
        </div>
      )}

      {/* Missões */}
      {missaoChurches.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Missões
          </h2>
          <ResponsiveDashboardGrid variant="pastor">
            {missaoChurches.map((church) => (
              <MissionCard key={church.id} church={church} />
            ))}
          </ResponsiveDashboardGrid>
        </div>
      )}

      {/* Empty state */}
      {churches.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-muted-foreground">Nenhuma igreja encontrada</h2>
            <p className="text-muted-foreground">
              Comece criando sua primeira igreja ou missão.
            </p>
          </div>
          {canCreateChurch && (
            <Button 
              className="gap-2"
              onClick={() => handleNovaIgreja('sede', true)}
            >
              <Plus className="h-4 w-4" />
              Criar Primeira Igreja
            </Button>
          )}
        </div>
      )}
      </div>

      <ModalCadastrarIgreja
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        initialType={modalInitialType}
        lockType={modalLockType}
      />
    </MissoesLayout>
  );
};

export default Missoes;