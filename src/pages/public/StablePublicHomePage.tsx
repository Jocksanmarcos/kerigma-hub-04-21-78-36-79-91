import React from "react";
import { Helmet } from "react-helmet-async";
import PublicHomePage from "./PublicHomePage";

const StablePublicHomePage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>CBN Kerigma | Início</title>
        <meta name="description" content="Bem-vindo à CBN Kerigma. Conheça eventos, ministérios e recursos." />
        <link rel="canonical" href={`${window.location.origin}/`} />
      </Helmet>
      <PublicHomePage />
    </>
  );
};

export default StablePublicHomePage;