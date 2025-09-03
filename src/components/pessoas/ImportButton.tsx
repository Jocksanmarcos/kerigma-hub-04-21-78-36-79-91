import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface ImportResult {
  success: number;
  errors: number;
  details: Array<{
    row: number;
    error: string;
    data?: any;
  }>;
}

export const ImportButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setResult(null);
      } else {
        toast({
          title: 'Formato inválido',
          description: 'Por favor, selecione um arquivo CSV ou Excel (.xlsx).',
          variant: 'destructive',
        });
      }
    }
  };

  const downloadTemplate = () => {
    const csvContent = `nome_completo,email,telefone,tipo_pessoa,situacao,estado_espiritual,data_nascimento,endereco,estado_civil,escolaridade,observacoes
João Silva,joao@email.com,(11) 99999-9999,membro,ativo,batizado,1985-05-15,Rua das Flores 123,casado,ensino_superior_completo,Exemplo de observação
Maria Santos,maria@email.com,(11) 88888-8888,visitante,ativo,interessado,1990-10-20,Av. Principal 456,solteiro,ensino_medio_completo,`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_pessoas.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: 'Nenhum arquivo selecionado',
        description: 'Por favor, selecione um arquivo para importar.',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    setProgress(0);
    setResult(null);

    try {
      // Converter arquivo para base64
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Chamar edge function para processar
      const { data, error } = await supabase.functions.invoke('import-pessoas', {
        body: {
          file: fileData,
          filename: file.name,
          mimetype: file.type
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) {
        throw error;
      }

      setResult(data);
      
      // Atualizar cache das queries
      queryClient.invalidateQueries({ queryKey: ['pessoas'] });
      
      if (data.success > 0) {
        toast({
          title: 'Importação concluída!',
          description: `${data.success} pessoa(s) importada(s) com sucesso.`,
        });
      }

      if (data.errors > 0) {
        toast({
          title: 'Importação com erros',
          description: `${data.errors} linha(s) com erro. Verifique os detalhes.`,
          variant: 'destructive',
        });
      }

    } catch (error: any) {
      console.error('Erro na importação:', error);
      toast({
        title: 'Erro na importação',
        description: error.message || 'Ocorreu um erro ao importar o arquivo.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetDialog = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
    setIsImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetDialog();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Importar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar Pessoas</DialogTitle>
          <DialogDescription>
            Importe dados de pessoas a partir de arquivos CSV ou Excel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4" />
              <span className="font-medium">Modelo de Importação</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Baixe o modelo CSV com os campos corretos para importação.
            </p>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Upload className="h-4 w-4 mr-2" />
              Baixar Modelo CSV
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Arquivo para Importar</Label>
            <Input
              ref={fileInputRef}
              id="file"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              disabled={isImporting}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Arquivo selecionado: {file.name}
              </p>
            )}
          </div>

          {/* Progress */}
          {isImporting && (
            <div className="space-y-2">
              <Label>Progresso da Importação</Label>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Processando arquivo... {progress}%
              </p>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{result.success}</strong> pessoa(s) importada(s)
                  </AlertDescription>
                </Alert>
                <Alert variant={result.errors > 0 ? "destructive" : "default"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{result.errors}</strong> erro(s) encontrado(s)
                  </AlertDescription>
                </Alert>
              </div>

              {result.details.length > 0 && (
                <div className="space-y-2">
                  <Label>Detalhes dos Erros</Label>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {result.details.map((detail, index) => (
                      <Alert key={index} variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Linha {detail.row}:</strong> {detail.error}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isImporting}
            >
              Fechar
            </Button>
            <Button 
              onClick={handleImport}
              disabled={!file || isImporting}
            >
              {isImporting ? 'Importando...' : 'Importar Arquivo'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};