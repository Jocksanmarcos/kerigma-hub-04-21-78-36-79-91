import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar,
  MapPin,
  Heart,
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';

interface PessoaGeneralInfoProps {
  pessoa: any;
}

export const PessoaGeneralInfo: React.FC<PessoaGeneralInfoProps> = ({ pessoa }) => {
  const calcularIdade = (dataNascimento: string) => {
    if (!dataNascimento) return null;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const getJornadaProgress = (estadoEspiritual: string) => {
    const etapas = {
      'interessado': 20,
      'convertido': 40,
      'batizado': 60,
      'membro': 80,
      'lider': 100
    };
    return etapas[estadoEspiritual as keyof typeof etapas] || 0;
  };

  const getJornadaColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-blue-600';
    if (progress >= 40) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const jornadaProgress = getJornadaProgress(pessoa.estado_espiritual);
  const idade = calcularIdade(pessoa.data_nascimento);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Informações Básicas */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Informações Pessoais</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {idade && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Idade:</strong> {idade} anos
                  </span>
                </div>
              )}
              
              {pessoa.endereco && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Endereço:</strong> {pessoa.endereco}
                  </span>
                </div>
              )}

              {pessoa.data_batismo && (
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Batizado em:</strong> {new Date(pessoa.data_batismo).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Membro desde:</strong> {new Date(pessoa.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {pessoa.observacoes && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Observações</h4>
                <p className="text-sm text-muted-foreground">{pessoa.observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Jornada Espiritual</span>
            </CardTitle>
            <CardDescription>
              Acompanhe o progresso na jornada de fé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={getJornadaColor(jornadaProgress)}>
                  {pessoa.estado_espiritual}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {jornadaProgress}% completo
                </span>
              </div>
              
              <Progress value={jornadaProgress} className="w-full" />
              
              <div className="grid grid-cols-5 gap-2 text-xs">
                <div className={`text-center ${jornadaProgress >= 20 ? 'text-primary' : 'text-muted-foreground'}`}>
                  Interessado
                </div>
                <div className={`text-center ${jornadaProgress >= 40 ? 'text-primary' : 'text-muted-foreground'}`}>
                  Convertido
                </div>
                <div className={`text-center ${jornadaProgress >= 60 ? 'text-primary' : 'text-muted-foreground'}`}>
                  Batizado
                </div>
                <div className={`text-center ${jornadaProgress >= 80 ? 'text-primary' : 'text-muted-foreground'}`}>
                  Membro
                </div>
                <div className={`text-center ${jornadaProgress >= 100 ? 'text-primary' : 'text-muted-foreground'}`}>
                  Líder
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar com Estatísticas */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo Rápido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={pessoa.situacao === 'ativo' ? 'default' : 'secondary'}>
                {pessoa.situacao}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tipo</span>
              <Badge variant="outline">
                {pessoa.tipo_pessoa}
              </Badge>
            </div>

            {pessoa.celulas && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Célula</span>
                <span className="text-sm font-medium">{pessoa.celulas.nome}</span>
              </div>
            )}

            {pessoa.profiles && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Perfil</span>
                <Badge variant="outline">
                  {pessoa.profiles.name}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Próximos Passos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pessoa.estado_espiritual === 'interessado' && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    Acompanhar interesse e convidar para estudos bíblicos
                  </p>
                </div>
              )}
              
              {pessoa.estado_espiritual === 'convertido' && !pessoa.data_batismo && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    Preparar para o batismo
                  </p>
                </div>
              )}
              
              {pessoa.estado_espiritual === 'batizado' && pessoa.tipo_pessoa === 'visitante' && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    Integrar como membro efetivo
                  </p>
                </div>
              )}
              
              {!pessoa.celula_id && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-800">
                    Integrar em uma célula
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};