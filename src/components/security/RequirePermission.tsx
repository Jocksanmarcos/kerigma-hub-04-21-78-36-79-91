import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePermission } from "@/hooks/usePermission";

interface RequirePermissionProps {
  action: string;
  subject: string;
  resourceType?: string | null;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const DefaultFallback = () => (
  <Alert>
    <AlertDescription>
      Você não tem permissão para acessar esta seção. Se precisar, solicite acesso ao administrador.
    </AlertDescription>
  </Alert>
);

export const RequirePermission: React.FC<RequirePermissionProps> = ({
  action,
  subject,
  resourceType = null,
  fallback,
  children,
}) => {
  const { data: allowed, isLoading, isError } = usePermission({ action, subject, resourceType });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-5 w-40 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !allowed) {
    return <>{fallback ?? <DefaultFallback />}</>;
  }

  return <>{children}</>;
};

export default RequirePermission;
