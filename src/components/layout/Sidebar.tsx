import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  GraduationCap,
  Calendar,
  Music,
  Ticket,
  Landmark,
  Briefcase,
  ShieldCheck,
  Settings,
  HeartHandshake,
  Layers,
  BarChart3,
  Brain,
  MessageSquare,
  BookOpen,
  ClipboardList,
  Globe,
  Search,
  HelpCircle,
  CheckCircle,
} from 'lucide-react';
import { useNewUserRole, newRolePermissions, UserRole } from '@/hooks/useNewRole';
import {
  Sidebar as SidebarUI,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

// Principal
const principalNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home, page: 'dashboard', roles: ['pastor', 'lider'] },
];

// Pessoas & Grupos
const pessoasGruposNavItems = [
  { title: 'Pessoas', url: '/dashboard/pessoas', icon: Users, page: 'pessoas', roles: ['pastor'] },
  { title: 'Células', url: '/dashboard/celulas', icon: HeartHandshake, page: 'celulas', roles: ['pastor', 'lider'] },
  { title: 'Ministérios', url: '/dashboard/ministerios', icon: Music, page: 'ministerios', roles: ['pastor', 'lider'] },
  { title: 'Busca de Talentos', url: '/admin/busca-voluntarios', icon: Search, page: 'busca-voluntarios', roles: ['pastor', 'lider'] },
];

// Desenvolvimento Ministerial
const desenvolvimentoNavItems = [
  { title: 'Jornada de Crescimento', url: '/jornada', icon: GraduationCap, page: 'jornada' }, // Visível para todos
  { title: 'Gerenciar Cursos', url: '/admin/jornada/cursos', icon: BookOpen, page: 'cursos', roles: ['pastor', 'lider'] },
  { title: 'Gerenciar Quizzes', url: '/admin/jornada/quizzes', icon: CheckCircle, page: 'quizzes', roles: ['pastor', 'lider'] },
  { title: 'Aconselhamento', url: '/dashboard/aconselhamento', icon: MessageSquare, page: 'aconselhamento' }, // Disponível para membros também
  { title: 'Missões', url: '/dashboard/missoes', icon: Globe, page: 'missoes', roles: ['pastor', 'lider'] },
  { title: 'Biblioteca', url: '/dashboard/biblioteca', icon: BookOpen, page: 'biblioteca' }, // Visível para todos
];

// Operações & Eventos
const operacoesNavItems = [
  { title: 'Agenda', url: '/dashboard/agenda', icon: Calendar, page: 'agenda' }, // Visível para todos
  { title: 'Eventos', url: '/dashboard/eventos', icon: Ticket, page: 'eventos' }, // Visível para todos
  { title: 'Patrimônio', url: '/dashboard/patrimonio', icon: Briefcase, page: 'patrimonio', roles: ['pastor'] },
];

// Finanças
const financasNavItems = [
  { title: 'Financeiro', url: '/dashboard/financeiro', icon: Landmark, page: 'financeiro', roles: ['pastor'] },
];

// Relatórios
const relatoriosNavItems = [
  { title: 'Analytics', url: '/admin/analytics', icon: BarChart3, page: 'analytics', roles: ['pastor', 'lider'] },
];

// Administração do Sistema
const adminNavItems = [
  { title: 'Configurações', url: '/admin/configuracoes', icon: Settings, page: 'configuracoes', roles: ['pastor', 'lider'] },
  { title: 'Gestão de Conteúdo', url: '/admin/content', icon: MessageSquare, page: 'content', roles: ['pastor'] },
  { title: 'Governança', url: '/admin/governanca', icon: ShieldCheck, page: 'governanca', roles: ['pastor'] },
  { title: 'Suporte', url: '/suporte', icon: HelpCircle, page: 'suporte' },
];

export const Sidebar: React.FC = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const { data: userRole } = useNewUserRole();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === '/dashboard' || currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  const getNavClass = (path: string) => {
    return isActive(path) 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";
  };

  // Filter items based on user role
  const filteredPrincipalItems = principalNavItems;
  
  const filteredPessoasGruposItems = pessoasGruposNavItems.filter(item => {
    if (item.roles && item.roles.length > 0 && userRole && !item.roles.includes(userRole)) {
      return false;
    }
    return true;
  });

  const filteredDesenvolvimentoItems = desenvolvimentoNavItems.filter(item => {
    if (item.roles && item.roles.length > 0 && userRole && !item.roles.includes(userRole)) {
      return false;
    }
    return true;
  });

  const filteredOperacoesItems = operacoesNavItems.filter(item => {
    if (item.roles && item.roles.length > 0 && userRole && !item.roles.includes(userRole)) {
      return false;
    }
    return true;
  });

  const filteredFinancasItems = financasNavItems.filter(item => {
    if (item.roles && item.roles.length > 0 && userRole && !item.roles.includes(userRole)) {
      return false;
    }
    return true;
  });
  
  const filteredRelatoriosItems = relatoriosNavItems.filter(item => {
    if (item.roles && item.roles.length > 0 && userRole && !item.roles.includes(userRole)) {
      return false;
    }
    return true;
  });

  const filteredAdminItems = adminNavItems.filter(item => {
    if (item.roles && item.roles.length > 0 && userRole && !item.roles.includes(userRole)) {
      return false;
    }
    return true;
  });

  return (
    <SidebarUI className={collapsed ? "w-14" : "w-64"}>
      <SidebarContent className="bg-card border-r">
        
        {/* Principal */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground">
              Principal
            </SidebarGroupLabel>
          )}
          
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredPrincipalItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${getNavClass(item.url)}`}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Pessoas & Grupos */}
        {filteredPessoasGruposItems.length > 0 && (
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground">
                Pessoas & Grupos
              </SidebarGroupLabel>
            )}
            
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredPessoasGruposItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${getNavClass(item.url)}`}
                        title={collapsed ? item.title : undefined}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Desenvolvimento Ministerial */}
        {filteredDesenvolvimentoItems.length > 0 && (
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground">
                Desenvolvimento Ministerial
              </SidebarGroupLabel>
            )}
            
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredDesenvolvimentoItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${getNavClass(item.url)}`}
                        title={collapsed ? item.title : undefined}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Operações & Eventos */}
        {filteredOperacoesItems.length > 0 && (
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground">
                Operações & Eventos
              </SidebarGroupLabel>
            )}
            
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredOperacoesItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${getNavClass(item.url)}`}
                        title={collapsed ? item.title : undefined}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Finanças */}
        {filteredFinancasItems.length > 0 && (
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground">
                Finanças
              </SidebarGroupLabel>
            )}
            
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredFinancasItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${getNavClass(item.url)}`}
                        title={collapsed ? item.title : undefined}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Relatórios */}
        {filteredRelatoriosItems.length > 0 && (
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground">
                Relatórios
              </SidebarGroupLabel>
            )}
            
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredRelatoriosItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${getNavClass(item.url)}`}
                        title={collapsed ? item.title : undefined}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Administração do Sistema */}
        {filteredAdminItems.length > 0 && (
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground">
                Administração do Sistema
              </SidebarGroupLabel>
            )}
            
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredAdminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${getNavClass(item.url)}`}
                        title={collapsed ? item.title : undefined}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </SidebarUI>
  );
};