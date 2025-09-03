import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Home, Users, ChevronDown, ChevronRight, User, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FamiliaMembro {
  id: string;
  nome_completo: string;
  data_nascimento?: string;
  tipo_vinculo: string;
  responsavel_familiar: boolean;
  idade?: number;
}

interface FamiliaAgrupada {
  familia_id: string;
  nome_familia: string;
  identificador: string;
  membros: FamiliaMembro[];
  pai?: FamiliaMembro;
  mae?: FamiliaMembro;
  filhos: FamiliaMembro[];
  outros: FamiliaMembro[];
}

export const FamilyTreeView: React.FC = () => {
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(new Set());

  const { data: familias, isLoading } = useQuery({
    queryKey: ['familias-tree'],
    queryFn: async () => {
      const { data: familiasData, error } = await supabase
        .from('familias')
        .select(`
          id,
          nome_familia,
          vinculos_familiares (
            pessoa_id,
            tipo_vinculo,
            responsavel_familiar,
            pessoas (
              id,
              nome_completo,
              data_nascimento
            )
          )
        `)
        .order('nome_familia');

      if (error) throw error;

      // Agrupar e organizar famílias por critérios hierárquicos
      const familiasAgrupadas: { [key: string]: FamiliaAgrupada[] } = {};

      familiasData?.forEach((familia) => {
        // Só processar famílias que têm membros
        if (!familia.vinculos_familiares || familia.vinculos_familiares.length === 0) {
          return;
        }

        const membros: FamiliaMembro[] = familia.vinculos_familiares.map((vinculo: any) => {
          const pessoa = vinculo.pessoas;
          const idade = pessoa.data_nascimento 
            ? Math.floor((new Date().getTime() - new Date(pessoa.data_nascimento).getTime()) / (1000 * 60 * 60 * 24 * 365))
            : undefined;

          return {
            id: pessoa.id,
            nome_completo: pessoa.nome_completo,
            data_nascimento: pessoa.data_nascimento,
            tipo_vinculo: vinculo.tipo_vinculo,
            responsavel_familiar: vinculo.responsavel_familiar,
            idade
          };
        });

        // Organizar membros por hierarquia
        const pai = membros.find(m => m.tipo_vinculo === 'pai');
        const mae = membros.find(m => m.tipo_vinculo === 'mae');
        const filhos = membros
          .filter(m => ['filho', 'filha'].includes(m.tipo_vinculo))
          .sort((a, b) => (b.idade || 0) - (a.idade || 0)); // Mais velhos primeiro
        const outros = membros
          .filter(m => !['pai', 'mae', 'filho', 'filha'].includes(m.tipo_vinculo))
          .sort((a, b) => {
            // Primeiro: responsável familiar vem primeiro
            if (a.responsavel_familiar && !b.responsavel_familiar) return -1;
            if (!a.responsavel_familiar && b.responsavel_familiar) return 1;
            // Segundo: ordenar por idade (mais velhos primeiro)
            return (b.idade || 0) - (a.idade || 0);
          });

        // Criar identificador único baseado nos critérios para evitar famílias duplicadas
        let identificador = familia.nome_familia;
        let chaveUnica = familia.nome_familia;
        
        if (pai && mae) {
          identificador += ` (${pai.nome_completo} e ${mae.nome_completo})`;
          chaveUnica += `_${pai.id}_${mae.id}`;
        } else if (pai) {
          identificador += ` (${pai.nome_completo})`;
          chaveUnica += `_${pai.id}`;
        } else if (mae) {
          identificador += ` (${mae.nome_completo})`;
          chaveUnica += `_${mae.id}`;
        } else if (membros.length > 0) {
          const responsavel = membros.find(m => m.responsavel_familiar) || membros[0];
          identificador += ` (${responsavel.nome_completo})`;
          chaveUnica += `_${responsavel.id}`;
        }

        // Verificar se já existe uma família com a mesma chave única
        const sobrenome = familia.nome_familia.split(' ').pop() || familia.nome_familia;
        
        if (!familiasAgrupadas[sobrenome]) {
          familiasAgrupadas[sobrenome] = [];
        }

        // Verificar se já existe uma família com identificação similar
        const familiaExistente = familiasAgrupadas[sobrenome].find(f => 
          f.identificador === identificador || 
          (f.pai?.id === pai?.id && f.mae?.id === mae?.id)
        );

        if (!familiaExistente) {
          familiasAgrupadas[sobrenome].push({
            familia_id: familia.id,
            nome_familia: familia.nome_familia,
            identificador,
            membros,
            pai,
            mae,
            filhos,
            outros
          });
        }
      });

      // Ordenar famílias dentro de cada sobrenome pelos critérios
      Object.keys(familiasAgrupadas).forEach(sobrenome => {
        familiasAgrupadas[sobrenome].sort((a, b) => {
          // Primeiro critério: nome do pai
          if (a.pai && b.pai) {
            return a.pai.nome_completo.localeCompare(b.pai.nome_completo);
          }
          if (a.pai && !b.pai) return -1;
          if (!a.pai && b.pai) return 1;

          // Segundo critério: nome da mãe
          if (a.mae && b.mae) {
            return a.mae.nome_completo.localeCompare(b.mae.nome_completo);
          }
          if (a.mae && !b.mae) return -1;
          if (!a.mae && b.mae) return 1;

          // Terceiro critério: nome da família
          return a.nome_familia.localeCompare(b.nome_familia);
        });
      });

      return familiasAgrupadas;
    }
  });

  const toggleFamily = (familiaId: string) => {
    const newExpanded = new Set(expandedFamilies);
    if (newExpanded.has(familiaId)) {
      newExpanded.delete(familiaId);
    } else {
      newExpanded.add(familiaId);
    }
    setExpandedFamilies(newExpanded);
  };

  const getTotalFamilias = () => {
    if (!familias) return 0;
    return Object.values(familias).reduce((total, grupo) => total + grupo.length, 0);
  };

  const renderMembro = (membro: FamiliaMembro, isResponsavel: boolean = false) => (
    <div key={membro.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50 border">
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <div>
          <div className="flex items-center gap-2">
            <Link to={`/dashboard/pessoas/${membro.id}`} className="font-medium hover:text-primary">
              {membro.nome_completo}
            </Link>
            {isResponsavel && <Crown className="h-3 w-3 text-accent" />}
          </div>
          <div className="text-xs text-muted-foreground flex gap-2">
            <Badge variant="outline">{membro.tipo_vinculo}</Badge>
            {membro.idade && <span>{membro.idade} anos</span>}
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Famílias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Árvore Genealógica das Famílias
          </div>
          <Badge variant="secondary">{getTotalFamilias()} famílias</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {familias && Object.entries(familias).map(([sobrenome, grupoFamilias]) => (
              <div key={sobrenome} className="border rounded-lg">
                <div className="p-3 bg-muted/50 border-b">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Sobrenome: {sobrenome}
                    <Badge variant="outline">{grupoFamilias.length} família(s)</Badge>
                  </h3>
                </div>
                
                <div className="p-3 space-y-3">
                  {grupoFamilias.map((familia) => (
                    <Collapsible key={familia.familia_id}>
                      <CollapsibleTrigger 
                        className="w-full"
                        onClick={() => toggleFamily(familia.familia_id)}
                      >
                        <div className="flex items-center justify-between w-full p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-2">
                            {expandedFamilies.has(familia.familia_id) ? 
                              <ChevronDown className="h-4 w-4" /> : 
                              <ChevronRight className="h-4 w-4" />
                            }
                            <Home className="h-4 w-4 text-primary" />
                            <span className="font-medium">{familia.identificador}</span>
                          </div>
                          <Badge variant="secondary">{familia.membros.length} membros</Badge>
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="mt-3">
                        <div className="ml-6 space-y-3 border-l-2 border-dashed border-muted pl-4">
                          {/* Pais */}
                          {(familia.pai || familia.mae) && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">Responsáveis</h4>
                              <div className="space-y-2">
                                {familia.pai && renderMembro(familia.pai, familia.pai.responsavel_familiar)}
                                {familia.mae && renderMembro(familia.mae, familia.mae.responsavel_familiar)}
                              </div>
                            </div>
                          )}
                          
                          {/* Filhos */}
                          {familia.filhos.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">Filhos</h4>
                              <div className="space-y-2">
                                {familia.filhos.map(filho => renderMembro(filho, filho.responsavel_familiar))}
                              </div>
                            </div>
                          )}
                          
                          {/* Outros */}
                          {familia.outros.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">Outros Membros</h4>
                              <div className="space-y-2">
                                {familia.outros.map(outro => renderMembro(outro, outro.responsavel_familiar))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};