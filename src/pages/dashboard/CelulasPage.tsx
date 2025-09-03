import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { CentroComandoCelulas } from "@/components/celulas/CentroComandoCelulas";
import { Helmet } from 'react-helmet-async';

const CelulasPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Células | CBN Kerigma</title>
        <meta name="description" content="Gerencie as células da igreja e acompanhe o crescimento espiritual da comunidade" />
      </Helmet>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Células</h1>
            <p className="text-muted-foreground">
              Gerencie as células da igreja e acompanhe o crescimento
            </p>
          </div>
          
          <CentroComandoCelulas />
        </div>
      </AppLayout>
    </>
  );
};

export default CelulasPage;