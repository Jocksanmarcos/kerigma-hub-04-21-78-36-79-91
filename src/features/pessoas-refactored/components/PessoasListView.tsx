import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Edit, Phone, Mail, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PessoasListViewProps {
  pessoas: any[];
  onEditPessoa: (pessoa: any) => void;
}

export const PessoasListView: React.FC<PessoasListViewProps> = ({
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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b">
            <TableHead className="w-[300px]">Pessoa</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Célula</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pessoas.map((pessoa) => (
            <TableRow key={pessoa.id} className="group hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-1 ring-border">
                    <AvatarImage src={pessoa.foto_url} alt={pessoa.nome_completo} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(pessoa.nome_completo)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">
                      {pessoa.nome_completo}
                    </p>
                    {pessoa.email && (
                      <p className="text-sm text-muted-foreground truncate">
                        {pessoa.email}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                {pessoa.telefone && (
                  <p className="text-sm text-muted-foreground">
                    {formatPhone(pessoa.telefone)}
                  </p>
                )}
              </TableCell>
              
              <TableCell>
                <Badge variant="outline" className={getStatusBadge(pessoa.situacao)}>
                  {pessoa.situacao}
                </Badge>
              </TableCell>
              
              <TableCell>
                {pessoa.tipo_pessoa && (
                  <Badge variant="outline" className={getTipoBadge(pessoa.tipo_pessoa)}>
                    {pessoa.tipo_pessoa}
                  </Badge>
                )}
              </TableCell>
              
              <TableCell>
                {pessoa.celulas && (
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                    {pessoa.celulas.nome}
                  </Badge>
                )}
              </TableCell>
              
              <TableCell className="text-right">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-8 w-8"
                  >
                    <Link to={`/dashboard/pessoas/${pessoa.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditPessoa(pessoa)}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  {pessoa.telefone && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(`tel:${pessoa.telefone}`)}
                        className="h-8 w-8"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(`https://wa.me/55${pessoa.telefone.replace(/\D/g, '')}`)}
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
                      onClick={() => window.open(`mailto:${pessoa.email}`)}
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