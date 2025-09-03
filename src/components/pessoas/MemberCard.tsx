import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  Users, 
  UserPlus, 
  Crown,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface MemberCardProps {
  pessoa: {
    id: string;
    nome_completo: string;
    email?: string;
    telefone?: string;
    foto_url?: string;
    tipo_pessoa: string;
    situacao: string;
    profiles?: {
      name: string;
      level: string;
      description: string;
    };
    celulas?: {
      nome: string;
    };
  };
  onEdit: (pessoa: any) => void;
  onDelete: (pessoaId: string, nomePessoa: string) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({ pessoa, onEdit, onDelete }) => {
  const getStatusIcon = (situacao: string) => {
    switch (situacao) {
      case 'ativo': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'inativo': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'afastado': return <Clock className="h-4 w-4 text-gray-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'membro': return <Users className="h-4 w-4 text-blue-600" />;
      case 'visitante': return <UserPlus className="h-4 w-4 text-purple-600" />;
      case 'lider': return <Crown className="h-4 w-4 text-amber-600" />;
      default: return <Users className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTipoBadge = (tipo: string) => {
    const variants = {
      membro: 'default',
      visitante: 'secondary', 
      lider: 'destructive'
    };
    return variants[tipo as keyof typeof variants] || 'outline';
  };

  const handlePhoneCall = () => {
    if (pessoa.telefone) {
      // Remove any non-numeric characters except +
      const cleanPhone = pessoa.telefone.replace(/[^\d+]/g, '');
      window.open(`tel:${cleanPhone}`, '_self');
    }
  };

  const handleWhatsApp = () => {
    if (pessoa.telefone) {
      // Remove any non-numeric characters except +
      let cleanPhone = pessoa.telefone.replace(/[^\d+]/g, '');
      // If phone doesn't start with +, assume it's Brazilian and add +55
      if (!cleanPhone.startsWith('+')) {
        cleanPhone = `+55${cleanPhone}`;
      }
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  const handleEmail = () => {
    if (pessoa.email) {
      window.open(`mailto:${pessoa.email}`, '_self');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <Card className="h-full hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        {/* Header com Avatar e Info Principal */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={pessoa.foto_url} alt={pessoa.nome_completo} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(pessoa.nome_completo)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate" title={pessoa.nome_completo}>
              {pessoa.nome_completo}
            </h3>
            <p className="text-xs text-muted-foreground truncate" title={pessoa.email}>
              {pessoa.email}
            </p>
            
            {/* Badges de Status e Tipo */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                {getTipoIcon(pessoa.tipo_pessoa)}
                <Badge variant={getTipoBadge(pessoa.tipo_pessoa) as any} className="text-xs px-2 py-0">
                  {pessoa.tipo_pessoa}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                {getStatusIcon(pessoa.situacao)}
                <span className="text-xs capitalize text-muted-foreground">
                  {pessoa.situacao}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="space-y-2 mb-4">
          {pessoa.profiles && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Perfil:</span>
              <Badge variant="outline" className="text-xs">
                {pessoa.profiles.name}
              </Badge>
            </div>
          )}
          
          {pessoa.celulas && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Célula:</span>
              <span className="text-xs font-medium truncate ml-2" title={pessoa.celulas.nome}>
                {pessoa.celulas.nome}
              </span>
            </div>
          )}
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePhoneCall}
            disabled={!pessoa.telefone}
            className={cn(
              "flex items-center justify-center gap-1 h-8 text-xs",
              !pessoa.telefone && "opacity-50 cursor-not-allowed"
            )}
            title={pessoa.telefone ? `Ligar para ${pessoa.telefone}` : "Telefone não disponível"}
          >
            <Phone className="h-3 w-3" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleWhatsApp}
            disabled={!pessoa.telefone}
            className={cn(
              "flex items-center justify-center gap-1 h-8 text-xs",
              !pessoa.telefone && "opacity-50 cursor-not-allowed"
            )}
            title={pessoa.telefone ? `WhatsApp para ${pessoa.telefone}` : "Telefone não disponível"}
          >
            <MessageCircle className="h-3 w-3" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleEmail}
            disabled={!pessoa.email}
            className={cn(
              "flex items-center justify-center gap-1 h-8 text-xs",
              !pessoa.email && "opacity-50 cursor-not-allowed"
            )}
            title={pessoa.email ? `Enviar email para ${pessoa.email}` : "Email não disponível"}
          >
            <Mail className="h-3 w-3" />
          </Button>
        </div>

        {/* Ações de Gerenciamento */}
        <div className="grid grid-cols-3 gap-1">
          <Button variant="outline" size="sm" asChild className="h-8 text-xs">
            <Link to={`/dashboard/pessoas/${pessoa.id}`}>
              <Eye className="h-3 w-3" />
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(pessoa)}
            className="h-8 text-xs"
          >
            <Edit className="h-3 w-3" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              if (window.confirm(`Tem certeza que deseja excluir ${pessoa.nome_completo}?`)) {
                onDelete(pessoa.id, pessoa.nome_completo);
              }
            }}
            className="h-8 text-xs text-destructive hover:text-destructive-foreground hover:bg-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};