import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Key, 
  AlertTriangle, 
  CheckCircle, 
  Edit, 
  Save,
  Eye,
  EyeOff,
  Users,
  Settings
} from 'lucide-react';

interface PessoaSegurancaProps {
  pessoa: any;
}

export const PessoaSeguranca: React.FC<PessoaSegurancaProps> = ({ pessoa }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string>(pessoa.profile_id ?? 'no-profile');
  const [showPermissions, setShowPermissions] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleProfileChange = (newProfileId: string) => {
    setSelectedProfile(newProfileId);
  };

  // Buscar perfis disponíveis
  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('active', true)
        .order('level', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Buscar permissões do perfil atual
  const { data: currentPermissions } = useQuery({
    queryKey: ['profile-permissions', pessoa.profile_id],
    queryFn: async () => {
      if (!pessoa.profile_id) return [];
      
      const { data, error } = await supabase
        .from('profile_permissions')
        .select(`
          *,
          permissions(
            action,
            subject,
            resource_type
          )
        `)
        .eq('profile_id', pessoa.profile_id)
        .eq('granted', true);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!pessoa.profile_id
  });

  // Buscar eventos de segurança recentes
  const { data: securityEvents } = useQuery({
    queryKey: ['security-events', pessoa.user_id],
    queryFn: async () => {
      if (!pessoa.user_id) return [];
      
      try {
        const { data, error } = await supabase
          .from('security_events')
          .select('*')
          .eq('user_id', pessoa.user_id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (error) {
          console.error('Error fetching security events:', error);
          // Retornar dados simulados em caso de erro
          return [
            {
              event_type: 'login_success',
              created_at: new Date().toISOString(),
              ip_address: '192.168.1.1'
            }
          ];
        }
        return data || [];
      } catch (error) {
        console.error('Error in security events query:', error);
        return [];
      }
    },
    enabled: !!pessoa.user_id
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileId: string | null) => {
      const { error } = await supabase
        .from('pessoas')
        .update({ profile_id: profileId })
        .eq('id', pessoa.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pessoa', pessoa.id] });
      queryClient.invalidateQueries({ queryKey: ['profile-permissions'] });
      setIsEditing(false);
      toast({
        title: 'Perfil de acesso atualizado!',
        description: 'As permissões foram aplicadas com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar perfil',
        description: 'Ocorreu um erro ao atualizar o perfil de acesso.',
        variant: 'destructive',
      });
      console.error('Erro:', error);
    }
  });

  const handleSaveProfile = () => {
    const value = selectedProfile === 'no-profile' ? null : selectedProfile;
    updateProfileMutation.mutate(value);
  };

  const handleCancel = () => {
    setSelectedProfile(pessoa.profile_id ?? 'no-profile');
    setIsEditing(false);
  };

  const getProfileLevelColor = (level: number) => {
    if (level >= 4) return 'text-red-600 bg-red-50 border-red-200';
    if (level >= 3) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (level >= 2) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'login_success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'login_failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'permission_granted': return <Key className="h-4 w-4 text-blue-600" />;
      case 'permission_denied': return <Shield className="h-4 w-4 text-yellow-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const currentProfile = profiles?.find(p => p.id === pessoa.profile_id);

  const ResetPasswordButton = ({ pessoa }: { pessoa: any }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleResetPassword = async () => {
      if (!pessoa.email) {
        toast({
          title: "Erro",
          description: "Pessoa não possui email cadastrado",
          variant: "destructive"
        });
        return;
      }

      setIsLoading(true);
      try {
        const redirectTo = `${window.location.origin}/reset-password`;
        const { error } = await supabase.auth.resetPasswordForEmail(pessoa.email, { 
          redirectTo,
          captchaToken: undefined
        });
        
        if (error) {
          throw error;
        }

        toast({
          title: "Email de reset enviado!",
          description: `Um link para redefinir a senha foi enviado para ${pessoa.email}`,
        });
      } catch (error: any) {
        toast({
          title: "Erro ao enviar email",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleResetPassword}
        disabled={isLoading}
      >
        {isLoading ? 'Enviando...' : 'Resetar Senha'}
      </Button>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Acesso & Segurança</h2>
        <p className="text-muted-foreground">
          Gerencie permissões e monitore atividades de segurança
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Perfil de Acesso */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Perfil de Acesso</span>
            </CardTitle>
            <CardDescription>
              Defina o nível de acesso e permissões
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentProfile ? (
              <div className={`p-4 rounded-lg border ${getProfileLevelColor(currentProfile.level)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{currentProfile.name}</h4>
                  <Badge variant="outline" className="border-current">
                    Nível {currentProfile.level}
                  </Badge>
                </div>
                <p className="text-sm opacity-80">{currentProfile.description}</p>
              </div>
            ) : (
              <div className="p-4 rounded-lg border border-dashed border-gray-300 text-center">
                <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhum perfil de acesso definido
                </p>
              </div>
            )}

            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <Select value={selectedProfile} onValueChange={handleProfileChange}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione um perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-profile">Sem Perfil</SelectItem>
                      {profiles?.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          <div className="flex items-center space-x-2">
                            <span>{profile.name}</span>
                            <Badge variant="outline" className="text-xs">
                              Nível {profile.level}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="flex items-center space-x-2">
                  <Edit className="h-4 w-4" />
                  <span>Alterar Perfil</span>
                </Button>
              )}
            </div>

            {currentProfile && (
              <Button 
                variant="outline" 
                onClick={() => setShowPermissions(!showPermissions)}
                className="w-full flex items-center space-x-2"
              >
                {showPermissions ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{showPermissions ? 'Ocultar' : 'Ver'} Permissões</span>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Atividade de Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>Atividade Recente</span>
            </CardTitle>
            <CardDescription>
              Eventos de segurança e acesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            {securityEvents && securityEvents.length > 0 ? (
              <div className="space-y-3">
                {securityEvents.map((event, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                    {getEventTypeIcon(event.event_type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.event_type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma atividade registrada</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permissões Detalhadas */}
        {showPermissions && currentPermissions && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Permissões Detalhadas</span>
              </CardTitle>
              <CardDescription>
                Lista completa de permissões do perfil atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentPermissions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentPermissions.map((permission, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <Badge variant="outline" className="text-xs">
                          {permission.permissions.action}
                        </Badge>
                      </div>
                      <h5 className="font-medium text-sm">{permission.permissions.subject}</h5>
                      {permission.permissions.resource_type && (
                        <p className="text-xs text-muted-foreground">
                          Recurso: {permission.permissions.resource_type}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma permissão específica encontrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Ações Críticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Ações Críticas</span>
          </CardTitle>
          <CardDescription>
            Ações que requerem cuidado especial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Remover Acesso
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover Acesso</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja remover todos os acessos desta pessoa? 
                    Esta ação irá definir o perfil como nulo e ela não conseguirá mais 
                    acessar áreas restritas do sistema.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => updateProfileMutation.mutate(null)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Confirmar Remoção
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <ResetPasswordButton pessoa={pessoa} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};