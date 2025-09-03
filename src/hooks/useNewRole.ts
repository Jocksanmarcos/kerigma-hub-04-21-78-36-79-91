import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'pastor' | 'lider' | 'membro';

export function useNewUserRole() {
  const [data, setData] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchUserRole = async () => {
      try {
        setIsLoading(true);
        const userResponse = await supabase.auth.getUser();
        const user = userResponse.data?.user;
        
        if (!user) {
          if (mounted) {
            setData(null);
            setIsLoading(false);
          }
          return;
        }
        
        // Buscar role do usuário na nova tabela
        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        // Fallback: se for o e-mail do administrador padrão, considere 'pastor'
        const isBootstrapAdmin = user.email?.toLowerCase() === 'admin@cbnkerigma.org.br';
        
        if (mounted) {
          if (error) {
            console.warn("Error fetching user role:", error);
            setData(isBootstrapAdmin ? 'pastor' as UserRole : 'membro' as UserRole);
          } else {
            const role = (roleData?.role as UserRole) || (isBootstrapAdmin ? 'pastor' as UserRole : 'membro' as UserRole);
            setData(role);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.warn("Error in useNewUserRole:", err);
        if (mounted) {
          setError(err as Error);
          setData('membro' as UserRole);
          setIsLoading(false);
        }
      }
    };

    fetchUserRole();

    // Listen for auth changes
    const authSubscription = supabase.auth.onAuthStateChange(() => {
      fetchUserRole();
    });

    return () => {
      mounted = false;
      authSubscription.data.subscription.unsubscribe();
    };
  }, []);

  return { data, isLoading, error };
}

export function useHasNewRole(role: UserRole): boolean {
  const { data: userRole } = useNewUserRole();
  
  if (userRole === 'pastor') return true;
  if (userRole === 'lider' && (role === 'lider' || role === 'membro')) return true;
  if (userRole === 'membro' && role === 'membro') return true;
  
  return false;
}

export const newRolePermissions: Record<UserRole, { name: string; pages: string[] }> = {
  pastor: {
    name: 'Pastor',
    pages: ['dashboard', 'pessoas', 'celulas', 'ensino', 'agenda', 'ministerios', 'cultos', 'eventos', 'financeiro', 'patrimonio', 'governanca', 'configuracoes', 'content', 'escalas', 'louvor', 'aconselhamento', 'ia-pastoral', 'analytics']
  },
  lider: {
    name: 'Líder', 
    pages: ['dashboard', 'celulas', 'ensino', 'agenda', 'eventos', 'escalas', 'analytics']
  },
  membro: {
    name: 'Membro',
    pages: ['dashboard', 'agenda', 'eventos', 'ensino', 'aconselhamento']
  }
};