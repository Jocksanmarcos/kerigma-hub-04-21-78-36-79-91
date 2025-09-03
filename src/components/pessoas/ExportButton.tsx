import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, Table } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExportButtonProps {
  searchTerm?: string;
  statusFilter?: string;
  tipoFilter?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  searchTerm = '',
  statusFilter = 'todos',
  tipoFilter = 'todos'
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const { data: pessoas } = useQuery({
    queryKey: ['pessoas-export', searchTerm, statusFilter, tipoFilter],
    queryFn: async () => {
      let query = supabase
        .from('pessoas')
        .select(`
          nome_completo,
          email,
          telefone,
          tipo_pessoa,
          situacao,
          estado_espiritual,
          data_nascimento,
          endereco,
          created_at,
          profiles!pessoas_profile_id_fkey(name),
          celulas!pessoas_celula_id_fkey(nome)
        `)
        .order('nome_completo', { ascending: true });

      if (searchTerm) {
        query = query.or(`nome_completo.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'todos') {
        query = query.eq('situacao', statusFilter);
      }

      if (tipoFilter !== 'todos') {
        query = query.eq('tipo_pessoa', tipoFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const exportToPDF = async () => {
    try {
      setIsExporting(true);
      
      // Usar a biblioteca pdfmake que já está instalada
      const { default: pdfMake } = await import('pdfmake/build/pdfmake');
      const { default: pdfFonts } = await import('pdfmake/build/vfs_fonts');
      
      pdfMake.vfs = pdfFonts.pdfMake.vfs;

      const docDefinition = {
        content: [
          {
            text: 'Relatório de Pessoas - Kerigma Hub',
            style: 'header',
            alignment: 'center',
            margin: [0, 0, 0, 20]
          },
          {
            text: `Gerado em: ${new Date().toLocaleDateString('pt-BR')}`,
            style: 'subheader',
            margin: [0, 0, 0, 20]
          },
          {
            table: {
              headerRows: 1,
              widths: ['*', '*', '*', '*', '*'],
              body: [
                [
                  { text: 'Nome', style: 'tableHeader' },
                  { text: 'Email', style: 'tableHeader' },
                  { text: 'Telefone', style: 'tableHeader' },
                  { text: 'Tipo', style: 'tableHeader' },
                  { text: 'Status', style: 'tableHeader' }
                ],
                ...(pessoas || []).map(pessoa => [
                  pessoa.nome_completo || '',
                  pessoa.email || '',
                  pessoa.telefone || '',
                  pessoa.tipo_pessoa || '',
                  pessoa.situacao || ''
                ])
              ]
            },
            layout: {
              fillColor: (rowIndex: number) => rowIndex === 0 ? '#f0f0f0' : null,
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5
            }
          }
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true
          },
          subheader: {
            fontSize: 12,
            color: '#666'
          },
          tableHeader: {
            bold: true,
            fontSize: 10,
            color: 'black'
          }
        },
        defaultStyle: {
          fontSize: 9
        }
      };

      pdfMake.createPdf(docDefinition).download(`pessoas-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: 'PDF exportado!',
        description: 'O relatório foi baixado com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível gerar o PDF.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    try {
      setIsExporting(true);
      
      // Usar a biblioteca XLSX que já está instalada
      const XLSX = await import('xlsx');
      
      const worksheet = XLSX.utils.json_to_sheet((pessoas || []).map((pessoa: any) => ({
        'Nome Completo': pessoa.nome_completo || '',
        'Email': pessoa.email || '',
        'Telefone': pessoa.telefone || '',
        'Tipo': pessoa.tipo_pessoa || '',
        'Situação': pessoa.situacao || '',
        'Estado Espiritual': pessoa.estado_espiritual || '',
        'Data Nascimento': pessoa.data_nascimento || '',
        'Endereço': pessoa.endereco || '',
        'Perfil Acesso': Array.isArray(pessoa.profiles) ? (pessoa.profiles[0]?.name ?? '') : (pessoa.profiles?.name ?? ''),
        'Célula': Array.isArray(pessoa.celulas) ? (pessoa.celulas[0]?.nome ?? '') : (pessoa.celulas?.nome ?? ''),
        'Data Cadastro': pessoa.created_at ? new Date(pessoa.created_at).toLocaleDateString('pt-BR') : ''
      })));

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Pessoas');
      
      XLSX.writeFile(workbook, `pessoas-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: 'Excel exportado!',
        description: 'A planilha foi baixada com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível gerar a planilha.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting || !pessoas?.length}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exportando...' : 'Exportar'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Exportar PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          <Table className="h-4 w-4 mr-2" />
          Exportar Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};