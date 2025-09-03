import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  BookOpen, 
  Award, 
  Calendar,
  Clock,
  TrendingUp,
  User,
  GraduationCap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface PessoaEnvolvimentoProps {
  pessoa: any;
}

export const PessoaEnvolvimento: React.FC<PessoaEnvolvimentoProps> = ({ pessoa }) => {
  // Buscar dados de envolvimento
  const { data: envolvimentoData } = useQuery({
    queryKey: ['pessoa-envolvimento', pessoa.id],
    queryFn: async () => {
      const [celulasResult, cursosResult, ministeriosResult] = await Promise.all([
        // Célula atual
        pessoa.celula_id ? supabase
          .from('celulas')
          .select(`
            *,
            lider:pessoas!lider_id(nome_completo),
            supervisor:pessoas!supervisor_id(nome_completo)
          `)
          .eq('id', pessoa.celula_id)
          .single() : Promise.resolve({ data: null, error: null }),
        
        // Buscar cursos reais se a pessoa tem matrículas
        supabase
          .from('matriculas')
          .select(`
            *,
            cursos(nome, categoria, carga_horaria)
          `)
          .eq('pessoa_id', pessoa.id) || Promise.resolve({ data: [], error: null }),
        
        // Buscar envolvimento em ministérios - usar dados simulados por enquanto
        Promise.resolve({ 
          data: pessoa.tipo_pessoa === 'lider' ? [
            {
              id: '1',
              nivel_competencia: 'avancado',
              funcoes_equipa: { nome_funcao: 'Líder de Célula' },
              equipas_ministeriais: { nome_equipa: 'Ministério de Células', ministerio_id: '1' }
            }
          ] : [], 
          error: null 
        })
      ]);

      return {
        celula: celulasResult.data,
        cursos: cursosResult.data || [],
        ministerios: ministeriosResult.data || []
      };
    },
    enabled: !!pessoa.id
  });

  // Buscar presenças recentes - dados simulados
  const { data: presencas } = useQuery({
    queryKey: ['pessoa-presencas', pessoa.id],
    queryFn: async () => {
      // Simular dados de presença
      return Array.from({ length: 5 }, (_, i) => ({
        data_presenca: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
        presente: Math.random() > 0.3
      }));
    },
    enabled: !!pessoa.id
  });

  const calcularFrequencia = () => {
    if (!presencas || presencas.length === 0) return 0;
    const presentes = presencas.filter(p => p.presente).length;
    return Math.round((presentes / presencas.length) * 100);
  };

  const getStatusCurso = (status: string) => {
    switch (status) {
      case 'concluido': return { icon: CheckCircle, color: 'text-green-600', variant: 'default' };
      case 'cursando': return { icon: Clock, color: 'text-blue-600', variant: 'secondary' };
      case 'matriculado': return { icon: AlertCircle, color: 'text-yellow-600', variant: 'outline' };
      default: return { icon: AlertCircle, color: 'text-gray-600', variant: 'outline' };
    }
  };

  const frequenciaMedia = calcularFrequencia();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Envolvimento na Igreja</h2>
        <p className="text-muted-foreground">
          Acompanhe a participação em células, ensino e ministérios
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Célula */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Célula</span>
            </CardTitle>
            <CardDescription>
              Participação em grupos pequenos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {envolvimentoData?.celula ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">{envolvimentoData.celula.nome}</h4>
                  <p className="text-sm text-muted-foreground">
                    Líder: {envolvimentoData.celula.pessoas?.nome_completo || 'Não definido'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {envolvimentoData.celula.dia_semana} às {envolvimentoData.celula.horario}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Frequência</span>
                    <span className="text-sm font-medium">{frequenciaMedia}%</span>
                  </div>
                  <Progress value={frequenciaMedia} className="w-full" />
                  <p className="text-xs text-muted-foreground">
                    Baseado nas últimas {presencas?.length || 0} reuniões
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <h5 className="font-medium mb-2">Presenças Recentes</h5>
                  <div className="grid grid-cols-5 gap-1">
                    {presencas?.slice(0, 5).map((presenca, index) => (
                      <div
                        key={index}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                          presenca.presente 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                        title={`${new Date(presenca.data_presenca).toLocaleDateString()} - ${presenca.presente ? 'Presente' : 'Ausente'}`}
                      >
                        {presenca.presente ? '✓' : '✗'}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Não está em nenhuma célula</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Considere integrá-la em um grupo pequeno
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ministérios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Ministérios</span>
            </CardTitle>
            <CardDescription>
              Áreas de serviço e liderança
            </CardDescription>
          </CardHeader>
          <CardContent>
            {envolvimentoData?.ministerios && envolvimentoData.ministerios.length > 0 ? (
              <div className="space-y-4">
                {envolvimentoData.ministerios.map((membro: any) => (
                  <div key={membro.id} className="border rounded-lg p-3">
                    <Badge variant="default" className="mb-2">
                      {membro.funcoes_equipa?.nome_funcao}
                    </Badge>
                    <h5 className="font-medium">{membro.equipas_ministeriais?.nome_equipa}</h5>
                    <p className="text-sm text-muted-foreground">
                      Nível: {membro.nivel_competencia}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Não está servindo em ministérios</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {pessoa.tipo_pessoa === 'lider' ? 'Líder em potencial' : 'Considere envolvê-la em áreas de serviço'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ensino - Cursos */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Ensino & Capacitação</span>
            </CardTitle>
            <CardDescription>
              Cursos realizados e em andamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {envolvimentoData?.cursos && envolvimentoData.cursos.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {envolvimentoData.cursos.map((matricula: any) => {
                    const statusInfo = getStatusCurso(matricula.status);
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <div key={matricula.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{matricula.cursos?.nome}</h4>
                          <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                        </div>
                        
                        <Badge variant={statusInfo.variant as any} className="mb-2">
                          {matricula.status}
                        </Badge>
                        
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p>Categoria: {matricula.cursos?.categoria}</p>
                          {matricula.cursos?.carga_horaria && (
                            <p>Carga horária: {matricula.cursos.carga_horaria}h</p>
                          )}
                          {matricula.data_matricula && (
                            <p>Matrícula: {new Date(matricula.data_matricula).toLocaleDateString()}</p>
                          )}
                          {matricula.data_conclusao && (
                            <p>Conclusão: {new Date(matricula.data_conclusao).toLocaleDateString()}</p>
                          )}
                          {matricula.nota_final && (
                            <p>Nota final: {matricula.nota_final}</p>
                          )}
                        </div>

                        {matricula.status === 'cursando' && matricula.frequencia_percentual && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-muted-foreground">Progresso</span>
                              <span className="text-xs text-muted-foreground">{matricula.frequencia_percentual}%</span>
                            </div>
                            <Progress value={matricula.frequencia_percentual} className="h-2" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {envolvimentoData.cursos.filter(c => c.status === 'concluido').length}
                      </div>
                      <div className="text-xs text-muted-foreground">Concluídos</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {envolvimentoData.cursos.filter(c => c.status === 'cursando').length}
                      </div>
                      <div className="text-xs text-muted-foreground">Em andamento</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {envolvimentoData.cursos.filter(c => c.status === 'matriculado').length}
                      </div>
                      <div className="text-xs text-muted-foreground">Matriculados</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Não possui cursos registrados</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Considere matricular em cursos de capacitação
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};