import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Building, 
  Calendar,
  ArrowRight,
  Download,
  Filter
} from 'lucide-react';
import { useChurches } from '@/hooks/useChurches';
import { useChurchContext } from '@/contexts/ChurchContext';
import { useNewUserRole } from '@/hooks/useNewRole';
import { ResponsiveDashboardGrid } from '@/components/ui/responsive-dashboard-grid';
import { MissoesLayout } from '@/components/missoes/MissoesLayout';

// Mock data para demonstração - em um app real viria da API
const getFinancialMovements = (churchId: string) => ({
  receitas: Math.floor(Math.random() * 15000) + 5000,
  despesas: Math.floor(Math.random() * 8000) + 2000,
  saldo: Math.floor(Math.random() * 10000) + 3000,
  movimento_mensal: Array.from({ length: 12 }, (_, i) => ({
    mes: i + 1,
    receitas: Math.floor(Math.random() * 15000) + 5000,
    despesas: Math.floor(Math.random() * 8000) + 2000,
  }))
});

const getRecentTransactions = (churchId: string) => 
  Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    data: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
    tipo: Math.random() > 0.5 ? 'receita' : 'despesa',
    valor: Math.floor(Math.random() * 2000) + 100,
    descricao: Math.random() > 0.5 ? 'Dízimos e Ofertas' : 'Material de Limpeza',
    categoria: Math.random() > 0.5 ? 'Dízimos' : 'Manutenção',
  }));

const FinancialCard: React.FC<{ church: any }> = ({ church }) => {
  const movements = getFinancialMovements(church.id);
  const transactions = getRecentTransactions(church.id);
  
  const saldoPositivo = movements.saldo >= 0;
  const crescimento = ((movements.receitas - movements.despesas) / movements.receitas * 100).toFixed(1);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-primary">{church.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{church.cidade}, {church.estado}</p>
          </div>
          <Badge variant={church.type === 'sede' ? 'default' : 'secondary'}>
            {church.type === 'sede' ? 'Sede' : 'Missão'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Resumo Financeiro */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-success mr-1" />
              <span className="text-xs text-muted-foreground">Receitas</span>
            </div>
            <div className="text-lg font-semibold text-success">
              R$ {movements.receitas.toLocaleString()}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingDown className="h-4 w-4 text-destructive mr-1" />
              <span className="text-xs text-muted-foreground">Despesas</span>
            </div>
            <div className="text-lg font-semibold text-destructive">
              R$ {movements.despesas.toLocaleString()}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="h-4 w-4 text-primary mr-1" />
              <span className="text-xs text-muted-foreground">Saldo</span>
            </div>
            <div className={`text-lg font-semibold ${saldoPositivo ? 'text-success' : 'text-destructive'}`}>
              R$ {movements.saldo.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Crescimento */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Crescimento Mensal</span>
            <div className={`flex items-center ${parseFloat(crescimento) >= 0 ? 'text-success' : 'text-destructive'}`}>
              {parseFloat(crescimento) >= 0 ? 
                <TrendingUp className="h-4 w-4 mr-1" /> : 
                <TrendingDown className="h-4 w-4 mr-1" />
              }
              <span className="text-sm font-medium">{crescimento}%</span>
            </div>
          </div>
        </div>

        {/* Últimas Transações */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Últimas Movimentações</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {transactions.slice(0, 4).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    transaction.tipo === 'receita' ? 'bg-success' : 'bg-destructive'
                  }`} />
                  <span className="truncate max-w-[100px]">{transaction.descricao}</span>
                </div>
                <span className={`font-medium ${
                  transaction.tipo === 'receita' ? 'text-success' : 'text-destructive'
                }`}>
                  {transaction.tipo === 'receita' ? '+' : '-'}R$ {transaction.valor}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" className="flex-1">
            Ver Detalhes
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const MissoesFinanceiro: React.FC = () => {
  const { data: churches = [], isLoading } = useChurches();
  const { isSuperAdmin } = useChurchContext();
  const { data: userRole, isLoading: roleLoading } = useNewUserRole();

  // Permitir acesso a pastores, líderes e super admins
  const hasAccess = isSuperAdmin || userRole === 'pastor' || userRole === 'lider';

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
            Apenas pastores e líderes podem acessar os dados financeiros das missões.
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
            <h1 className="text-3xl font-bold text-primary">Movimento Financeiro das Missões</h1>
            <p className="text-muted-foreground">
              Acompanhe as receitas, despesas e saldos de todas as missões
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

  // Calcular totais consolidados
  const totalReceitas = churches.reduce((acc, church) => {
    const movements = getFinancialMovements(church.id);
    return acc + movements.receitas;
  }, 0);

  const totalDespesas = churches.reduce((acc, church) => {
    const movements = getFinancialMovements(church.id);
    return acc + movements.despesas;
  }, 0);

  const saldoTotal = totalReceitas - totalDespesas;

  return (
    <MissoesLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-primary">Movimento Financeiro das Missões</h1>
          <p className="text-muted-foreground">
            Acompanhe as receitas, despesas e saldos de todas as missões da rede CBN Kerigma
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Resumo Consolidado */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <div>
                <div className="text-2xl font-bold text-success">R$ {totalReceitas.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total de Receitas</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
              <div>
                <div className="text-2xl font-bold text-destructive">R$ {totalDespesas.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total de Despesas</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <div className={`text-2xl font-bold ${saldoTotal >= 0 ? 'text-success' : 'text-destructive'}`}>
                  R$ {saldoTotal.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Saldo Consolidado</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold text-primary">{churches.length}</div>
                <div className="text-sm text-muted-foreground">Total de Unidades</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Igrejas Sede */}
      {sedeChurches.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Building className="h-6 w-6" />
            Movimento Financeiro - Igrejas Sede
          </h2>
          <ResponsiveDashboardGrid variant="pastor">
            {sedeChurches.map((church) => (
              <FinancialCard key={church.id} church={church} />
            ))}
          </ResponsiveDashboardGrid>
        </div>
      )}

      {/* Missões */}
      {missaoChurches.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Building className="h-6 w-6" />
            Movimento Financeiro - Missões
          </h2>
          <ResponsiveDashboardGrid variant="pastor">
            {missaoChurches.map((church) => (
              <FinancialCard key={church.id} church={church} />
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
              Não há dados financeiros disponíveis para exibir.
            </p>
          </div>
        </div>
      )}
      </div>
    </MissoesLayout>
  );
};

export default MissoesFinanceiro;