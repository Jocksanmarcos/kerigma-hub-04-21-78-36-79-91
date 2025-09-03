import React from 'react';
import { Phone, Mail, MessageCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PessoaData } from './MemberCard';

interface MembersListProps {
  pessoas: PessoaData[];
  onCall?: (telefone: string) => void;
  onEmail?: (email: string) => void;
  onWhatsApp?: (telefone: string) => void;
  onViewProfile?: (id: string) => void;
}

export const MembersList: React.FC<MembersListProps> = ({
  pessoas,
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

  if (pessoas.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhuma pessoa encontrada com os filtros selecionados.</p>
      </div>
    );
  }

  return (
    <div className="rounded-kerigma border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b">
            <TableHead className="w-[300px]">Pessoa</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Célula</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pessoas.map((pessoa) => (
            <TableRow key={pessoa.id} className="group hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 ring-1 ring-border">
                    <AvatarImage src={pessoa.foto_url} alt={pessoa.nome_completo} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {getInitials(pessoa.nome_completo)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-responsive-sm text-foreground truncate">
                      {pessoa.nome_completo}
                    </p>
                    {pessoa.email && (
                      <p className="text-responsive-xs text-muted-foreground truncate">
                        {pessoa.email}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                {pessoa.telefone && (
                  <p className="text-responsive-xs text-muted-foreground">
                    {formatPhone(pessoa.telefone)}
                  </p>
                )}
              </TableCell>
              
              <TableCell>
                <div className="flex flex-wrap gap-1">
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
                </div>
              </TableCell>
              
              <TableCell>
                {pessoa.celula && (
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                    {pessoa.celula.nome}
                  </Badge>
                )}
              </TableCell>
              
              <TableCell className="text-right">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewProfile?.(pessoa.id)}
                    className="h-8 w-8"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {pessoa.telefone && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onCall?.(pessoa.telefone!)}
                        className="h-8 w-8"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onWhatsApp?.(pessoa.telefone!)}
                        className="h-8 w-8 text-green-600 hover:bg-green-500/10"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  
                  {pessoa.email && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEmail?.(pessoa.email!)}
                      className="h-8 w-8"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};