import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Edit, Phone, Mail, MessageCircle, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';

interface PessoasGridViewProps {
  pessoas: any[];
  onEditPessoa: (pessoa: any) => void;
}

export const PessoasGridView: React.FC<PessoasGridViewProps> = ({
  pessoas,
  onEditPessoa,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getStatusBadge = (situacao: string) => {
    const variants = {
      ativo: 'bg-success/10 text-success border-success/20',
      inativo: 'bg-muted text-muted-foreground border-border',
      afastado: 'bg-warning/10 text-warning border-warning/20',
    };
    return variants[situacao as keyof typeof variants] || variants.inativo;
  };

  const getTipoBadge = (tipo: string) => {
    const variants = {
      membro: 'bg-primary/10 text-primary border-primary/20',
      visitante: 'bg-info/10 text-info border-info/20',
      lider: 'bg-kerigma-gradient text-white border-0',
      congregado: 'bg-accent/10 text-accent border-accent/20',
    };
    return variants[tipo as keyof typeof variants] || variants.membro;
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return '';
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 11) {
      return `(${clean.substring(0, 2)}) ${clean.substring(2, 7)}-${clean.substring(7)}`;
    }
    return phone;
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {pessoas.map((pessoa) => (
          <Card key={pessoa.id} className="group hover:shadow-kerigma-md transition-all duration-200 hover:-translate-y-1">
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
                      <h3 className="font-semibold text-sm text-foreground truncate">
                        {pessoa.nome_completo}
                      </h3>
                      
                      {pessoa.email && (
                        <p className="text-xs text-muted-foreground truncate">
                          {pessoa.email}
                        </p>
                      )}
                      
                      {pessoa.telefone && (
                        <p className="text-xs text-muted-foreground">
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
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link to={`/dashboard/pessoas/${pessoa.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Perfil
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditPessoa(pessoa)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        {pessoa.telefone && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => window.open(`tel:${pessoa.telefone}`)}
                            >
                              <Phone className="h-4 w-4 mr-2" />
                              Ligar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => window.open(`https://wa.me/55${pessoa.telefone.replace(/\D/g, '')}`)}
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              WhatsApp
                            </DropdownMenuItem>
                          </>
                        )}
                        {pessoa.email && (
                          <DropdownMenuItem 
                            onClick={() => window.open(`mailto:${pessoa.email}`)}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            E-mail
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pessoa.situacao && (
                      <Badge variant="outline" className={getStatusBadge(pessoa.situacao)}>
                        {pessoa.situacao}
                      </Badge>
                    )}
                    
                    {pessoa.tipo_pessoa && (
                      <Badge variant="outline" className={getTipoBadge(pessoa.tipo_pessoa)}>
                        {pessoa.tipo_pessoa}
                      </Badge>
                    )}
                    
                    {pessoa.celulas && (
                      <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                        {pessoa.celulas.nome}
                      </Badge>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-1 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1"
                    >
                      <Link to={`/dashboard/pessoas/${pessoa.id}`}>
                        <Eye className="h-3 w-3" />
                      </Link>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditPessoa(pessoa)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    
                    {pessoa.telefone && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://wa.me/55${pessoa.telefone.replace(/\D/g, '')}`)}
                        className="flex-1 bg-green-500/10 border-green-500/20 text-green-600 hover:bg-green-500/20"
                      >
                        <MessageCircle className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};