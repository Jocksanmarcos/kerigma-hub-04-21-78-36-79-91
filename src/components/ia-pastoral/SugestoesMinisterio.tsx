import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Heart, Music, BookOpen, Coffee, HandHeart, Star, Target } from 'lucide-react';

export const SugestoesMinisterio: React.FC = () => {
  const [pessoaAtiva, setPessoaAtiva] = useState(null);

  // Dados mockados para demonstração
  const ministerios = [
    {
      id: 'louvor',
      nome: 'Ministério de Louvor',
      icon: Music,
      vagas: 3,
      descricao: 'Equipe de música e adoração',
      habilidades: ['Música', 'Canto', 'Instrumentos'],
      compromisso: 'Alto'
    },
    {
      id: 'ensino',
      nome: 'Ministério de Ensino',
      icon: BookOpen,
      vagas: 5,
      descricao: 'Professores de EBD e estudos bíblicos',
      habilidades: ['Ensino', 'Comunicação', 'Estudo Bíblico'],
      compromisso: 'Médio'
    },
    {
      id: 'acolhimento',
      nome: 'Ministério de Acolhimento',
      icon: Coffee,
      vagas: 8,
      descricao: 'Recepção e integração de visitantes',
      habilidades: ['Hospitalidade', 'Comunicação', 'Empatia'],
      compromisso: 'Baixo'
    },
    {
      id: 'acao_social',
      nome: 'Ação Social',
      icon: HandHeart,
      vagas: 2,
      descricao: 'Projetos sociais e assistência',
      habilidades: ['Organização', 'Compaixão', 'Liderança'],
      compromisso: 'Médio'
    }
  ];

  const matchesSugeridos = [
    {
      pessoa: 'Maria Silva',
      ministerio: 'Ministério de Ensino',
      compatibilidade: 95,
      razoes: [
        'Formação em Pedagogia',
        'Experiência com ensino',
        'Conhecimento bíblico sólido',
        'Perfil comunicativo'
      ],
      proximosPassos: [
        'Conversa com coordenador do ministério',
        'Período de observação de 2 semanas',
        'Treinamento específico',
        'Começar com classe infantil'
      ]
    },
    {
      pessoa: 'João Santos',
      ministerio: 'Ministério de Acolhimento',
      compatibilidade: 87,
      razoes: [
        'Personalidade acolhedora',
        'Experiência em atendimento ao cliente',
        'Disponibilidade nos finais de semana',
        'Coração para evangelismo'
      ],
      proximosPassos: [
        'Treinamento de recepção',
        'Acompanhar equipe experiente',
        'Curso de evangelismo pessoal',
        'Integração gradual'
      ]
    },
    {
      pessoa: 'Ana Costa',
      ministerio: 'Ministério de Louvor',
      compatibilidade: 92,
      razoes: [
        'Formação musical',
        'Experiência com coral',
        'Coração adorador',
        'Compromisso com excelência'
      ],
      proximosPassos: [
        'Audição com coordenador musical',
        'Integração ao ensaio',
        'Período de adaptação',
        'Definição de instrumento/vocal'
      ]
    }
  ];

  const getCompatibilidadeColor = (valor: number) => {
    if (valor >= 90) return 'text-green-500';
    if (valor >= 75) return 'text-blue-500';
    if (valor >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getCompromissoColor = (nivel: string) => {
    switch (nivel) {
      case 'Alto': return 'destructive';
      case 'Médio': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="matches" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="matches">Matches Sugeridos</TabsTrigger>
          <TabsTrigger value="ministerios">Ministérios Disponíveis</TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Matches Personalizados</span>
              </CardTitle>
              <CardDescription>
                Sugestões de ministério baseadas no perfil e habilidades de cada pessoa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {matchesSugeridos.map((match, index) => (
                  <div key={index} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{match.pessoa}</h3>
                        <p className="text-muted-foreground">{match.ministerio}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getCompatibilidadeColor(match.compatibilidade)}`}>
                          {match.compatibilidade}%
                        </div>
                        <div className="text-xs text-muted-foreground">compatibilidade</div>
                      </div>
                    </div>

                    <Progress value={match.compatibilidade} className="mb-4" />

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center space-x-2">
                          <Star className="h-4 w-4" />
                          <span>Por que é um bom match?</span>
                        </h4>
                        <div className="space-y-1">
                          {match.razoes.map((razao, i) => (
                            <div key={i} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <span className="text-sm">{razao}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2 flex items-center space-x-2">
                          <Target className="h-4 w-4" />
                          <span>Próximos Passos</span>
                        </h4>
                        <div className="space-y-1">
                          {match.proximosPassos.map((passo, i) => (
                            <div key={i} className="flex items-center space-x-2">
                              <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                                <span className="text-xs font-bold">{i + 1}</span>
                              </div>
                              <span className="text-sm">{passo}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                      <Button variant="outline">
                        Ver Perfil Completo
                      </Button>
                      <Button>
                        Iniciar Processo
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ministerios" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {ministerios.map((ministerio) => {
              const IconComponent = ministerio.icon;
              return (
                <Card key={ministerio.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <div className="p-2 bg-kerigma-gradient rounded-lg">
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <span>{ministerio.nome}</span>
                    </CardTitle>
                    <CardDescription>
                      {ministerio.descricao}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Vagas Disponíveis</span>
                      <Badge variant="outline">{ministerio.vagas} vagas</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Nível de Compromisso</span>
                      <Badge variant={getCompromissoColor(ministerio.compromisso) as any}>
                        {ministerio.compromisso}
                      </Badge>
                    </div>

                    <div>
                      <span className="text-sm font-medium mb-2 block">Habilidades Desejadas</span>
                      <div className="flex flex-wrap gap-1">
                        {ministerio.habilidades.map((habilidade, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {habilidade}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full">
                      Buscar Candidatos
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};