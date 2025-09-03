import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  User,
  TrendingUp,
  Target,
  Lightbulb
} from 'lucide-react';
import { usePastoralAI } from '@/hooks/usePastoralAI';
import { useQuery } from '@tanstack/react-query';

interface PastoralInsightsCardProps {
  pessoaId: string;
}

export const PastoralInsightsCard: React.FC<PastoralInsightsCardProps> = ({ pessoaId }) => {
  const { generatePastoralInsights, isGeneratingInsights } = usePastoralAI();

  const { data: insights, refetch } = useQuery({
    queryKey: ['pastoral-insights', pessoaId],
    queryFn: () => generatePastoralInsights.mutateAsync(pessoaId),
    enabled: false // Só executa quando chamado manualmente
  });

  const handleGenerateInsights = () => {
    refetch();
  };

  const getRiscoColor = (risco: string) => {
    switch (risco) {
      case 'alto': return 'bg-red-100 text-red-800 border-red-200';
      case 'medio': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baixo': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiscoIcon = (risco: string) => {
    switch (risco) {
      case 'alto': return <AlertTriangle className="h-4 w-4" />;
      case 'medio': return <Clock className="h-4 w-4" />;
      case 'baixo': return <CheckCircle className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>IA Pastoral</span>
            </CardTitle>
            <CardDescription>
              Insights inteligentes para cuidado pastoral
            </CardDescription>
          </div>
          <Button 
            onClick={handleGenerateInsights}
            disabled={isGeneratingInsights}
            size="sm"
            variant="outline"
          >
            {isGeneratingInsights ? 'Analisando...' : 'Gerar Insights'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {insights ? (
          <div className="space-y-4">
            {/* Risco de Inatividade */}
            <div>
              <h4 className="font-medium mb-2 flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Risco de Inatividade</span>
              </h4>
              <Badge className={`${getRiscoColor(insights.risco_inatividade)} flex items-center space-x-1 w-fit`}>
                {getRiscoIcon(insights.risco_inatividade)}
                <span className="capitalize">{insights.risco_inatividade}</span>
              </Badge>
            </div>

            {/* Alertas */}
            {insights.alertas && insights.alertas.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span>Alertas</span>
                </h4>
                {insights.alertas.map((alerta, index) => (
                  <Alert key={index} className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      {alerta}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Sugestões Pastorais */}
            {insights.sugestoes_pastorais && insights.sugestoes_pastorais.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4" />
                  <span>Sugestões Pastorais</span>
                </h4>
                <div className="space-y-2">
                  {insights.sugestoes_pastorais.map((sugestao, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-800">{sugestao}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                💡 Insights gerados por IA. Última atualização: {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Clique em "Gerar Insights" para análise pastoral inteligente
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};