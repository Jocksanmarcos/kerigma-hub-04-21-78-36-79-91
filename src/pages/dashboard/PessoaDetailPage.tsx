import React from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PessoaProfile } from '@/components/pessoas/PessoaProfile';

const PessoaDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold">Pessoa não encontrada</h2>
          <p className="text-muted-foreground mt-2">
            O ID da pessoa não foi fornecido ou é inválido.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PessoaProfile pessoaId={id} />
    </AppLayout>
  );
};

export default PessoaDetailPage;