import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Users, 
  BookOpen,
  Heart,
  Edit,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PessoaGeneralInfo } from './profile/PessoaGeneralInfo';
import { PessoaCadastroInfo } from './profile/PessoaCadastroInfo';
import { PessoaEnvolvimento } from './profile/PessoaEnvolvimento';
import { PessoaFamilia } from './profile/PessoaFamilia';
import { PessoaSeguranca } from './profile/PessoaSeguranca';
import { PessoaNotasConfidenciais } from './profile/PessoaNotasConfidenciais';
import { PastoralInsightsCard } from './PastoralInsightsCard';

interface PessoaProfileProps {
  pessoaId: string;
}

export const PessoaProfile: React.FC<PessoaProfileProps> = ({ pessoaId }) => {
  const { data: pessoa, isLoading, error } = useQuery({
    queryKey: ['pessoa', pessoaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pessoas')
        .select(`
          *,
          profiles!pessoas_profile_id_fkey(name, level, description),
          celulas!pessoas_celula_id_fkey(nome, lider_id)
        `)
        .eq('id', pessoaId)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-2">Carregando perfil...</p>
      </div>
    );
  }

  if (error || !pessoa) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold">Pessoa não encontrada</h2>
        <p className="text-muted-foreground mt-2">
          Não foi possível carregar os dados da pessoa.
        </p>
        <Button asChild className="mt-4">
          <Link to="/dashboard/pessoas">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar à lista
          </Link>
        </Button>
      </div>
    );
  }

  const getTipoBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'membro': return 'default';
      case 'visitante': return 'secondary';
      case 'lider': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ativo': return 'default';
      case 'inativo': return 'secondary';
      case 'afastado': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header do Perfil */}
      <div className="flex justify-between items-start">
        <Button variant="outline" asChild>
          <Link to="/dashboard/pessoas">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar à lista
          </Link>
        </Button>
        <Button>
          <Edit className="h-4 w-4 mr-2" />
          Editar Pessoa
        </Button>
      </div>

      {/* Card Principal com Informações Básicas */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-kerigma-gradient rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">{pessoa.nome_completo}</CardTitle>
                <CardDescription className="flex items-center space-x-4 mt-2">
                  {pessoa.email && (
                    <span className="flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span>{pessoa.email}</span>
                    </span>
                  )}
                  {pessoa.telefone && (
                    <span className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{pessoa.telefone}</span>
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Badge variant={getTipoBadgeVariant(pessoa.tipo_pessoa) as any}>
                {pessoa.tipo_pessoa}
              </Badge>
              <Badge variant={getStatusBadgeVariant(pessoa.situacao) as any}>
                {pessoa.situacao}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Abas do Perfil */}
      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="geral" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="cadastro" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Cadastro</span>
          </TabsTrigger>
          <TabsTrigger value="envolvimento" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Envolvimento</span>
          </TabsTrigger>
          <TabsTrigger value="familia" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Família</span>
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Acesso</span>
          </TabsTrigger>
          <TabsTrigger value="notas" className="flex items-center space-x-2">
            <Heart className="h-4 w-4" />
            <span>Notas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PessoaGeneralInfo pessoa={pessoa} />
            </div>
            <div>
              <PastoralInsightsCard pessoaId={pessoa.id} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cadastro">
          <PessoaCadastroInfo pessoa={pessoa} />
        </TabsContent>

        <TabsContent value="envolvimento">
          <PessoaEnvolvimento pessoa={pessoa} />
        </TabsContent>

        <TabsContent value="familia">
          <PessoaFamilia pessoa={pessoa} />
        </TabsContent>

        <TabsContent value="seguranca">
          <PessoaSeguranca pessoa={pessoa} />
        </TabsContent>

        <TabsContent value="notas">
          <PessoaNotasConfidenciais pessoa={pessoa} />
        </TabsContent>
      </Tabs>
    </div>
  );
};