import React from 'react';
import { Phone, Mail, MessageCircle, MoreHorizontal, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface PessoaData {
  id: string;
  nome_completo: string;
  email?: string;
  telefone?: string;
  foto_url?: string;
  tipo_pessoa?: string;
  situacao?: string;
  data_nascimento?: string;
  celula?: {
    nome: string;
  };
  ministerios?: Array<{
    nome: string;
  }>;
}

interface MemberCardProps {
  pessoa: PessoaData;
  onCall?: (telefone: string) => void;
  onEmail?: (email: string) => void;
  onWhatsApp?: (telefone: string) => void;
  onViewProfile?: (id: string) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  pessoa,
  onCall,
  onEmail,
  onWhatsApp,
  onViewProfile
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return '';
    // Simple Brazilian phone formatting
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 11) {
      return `(${clean.substring(0, 2)}) ${clean.substring(2, 7)}-${clean.substring(7)}`;
    }
    return phone;
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-success/10 text-success border-success/20';
      case 'inativo':
        return 'bg-muted text-muted-foreground border-border';
      case 'afastado':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getTipoPessoaColor = (tipo?: string) => {
    switch (tipo) {
      case 'membro':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'visitante':
        return 'bg-info/10 text-info border-info/20';
      case 'lider':
        return 'bg-kerigma-gradient text-white border-0';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Card className="group hover:shadow-kerigma-md transition-all duration-200 hover:-translate-y-1">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Avatar className="h-12 w-12 ring-2 ring-border group-hover:ring-primary/20 transition-colors">
            <AvatarImage src={pessoa.foto_url} alt={pessoa.nome_completo} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(pessoa.nome_completo)}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-responsive-sm text-foreground truncate">
                  {pessoa.nome_completo}
                </h3>
                
                {pessoa.email && (
                  <p className="text-responsive-xs text-muted-foreground truncate">
                    {pessoa.email}
                  </p>
                )}
                
                {pessoa.telefone && (
                  <p className="text-responsive-xs text-muted-foreground">
                    {formatPhone(pessoa.telefone)}
                  </p>
                )}
              </div>

              {/* Menu de ações */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border shadow-kerigma z-50">
                  <DropdownMenuItem onClick={() => onViewProfile?.(pessoa.id)}>
                    Ver Perfil
                  </DropdownMenuItem>
                  {pessoa.telefone && (
                    <DropdownMenuItem onClick={() => onCall?.(pessoa.telefone!)}>
                      Ligar
                    </DropdownMenuItem>
                  )}
                  {pessoa.email && (
                    <DropdownMenuItem onClick={() => onEmail?.(pessoa.email!)}>
                      Enviar E-mail
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1 mt-2">
              {pessoa.situacao && (
                <Badge variant="outline" className={getStatusColor(pessoa.situacao)}>
                  {pessoa.situacao}
                </Badge>
              )}
              
              {pessoa.tipo_pessoa && (
                <Badge variant="outline" className={getTipoPessoaColor(pessoa.tipo_pessoa)}>
                  {pessoa.tipo_pessoa}
                </Badge>
              )}
              
              {pessoa.celula && (
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                  {pessoa.celula.nome}
                </Badge>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-1 mt-3">
              {pessoa.telefone && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCall?.(pessoa.telefone!)}
                    className="flex-1"
                  >
                    <Phone className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onWhatsApp?.(pessoa.telefone!)}
                    className="flex-1 bg-green-500/10 border-green-500/20 text-green-600 hover:bg-green-500/20"
                  >
                    <MessageCircle className="h-3 w-3" />
                  </Button>
                </>
              )}
              
              {pessoa.email && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEmail?.(pessoa.email!)}
                  className="flex-1"
                >
                  <Mail className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};