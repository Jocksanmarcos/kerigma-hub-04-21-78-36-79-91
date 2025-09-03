import React from 'react';
import { MemberCard, PessoaData } from './MemberCard';

interface MembersGridProps {
  pessoas: PessoaData[];
  onCall?: (telefone: string) => void;
  onEmail?: (email: string) => void;
  onWhatsApp?: (telefone: string) => void;
  onViewProfile?: (id: string) => void;
}

export const MembersGrid: React.FC<MembersGridProps> = ({
  pessoas,
  onCall,
  onEmail,
  onWhatsApp,
  onViewProfile
}) => {
  if (pessoas.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhuma pessoa encontrada com os filtros selecionados.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {pessoas.map((pessoa) => (
        <MemberCard
          key={pessoa.id}
          pessoa={pessoa}
          onCall={onCall}
          onEmail={onEmail}
          onWhatsApp={onWhatsApp}
          onViewProfile={onViewProfile}
        />
      ))}
    </div>
  );
};