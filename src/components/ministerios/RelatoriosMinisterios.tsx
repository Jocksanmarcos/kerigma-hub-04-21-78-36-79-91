import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Music, Users, AlertTriangle, BarChart3 } from "lucide-react";

export default function RelatoriosMinisterios() {
  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-4 w-4" /> Músicas mais usadas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span>Grandes Coisas</span>
            <Badge>18x</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Teu Amor Não Falha</span>
            <Badge variant="outline">12x</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Bondade de Deus</span>
            <Badge variant="secondary">9x</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Performance de membros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <div className="mb-1 flex items-center justify-between"><span>Assiduidade média</span><span>92%</span></div>
            <Progress value={92} />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between"><span>Confirmações no prazo</span><span>85%</span></div>
            <Progress value={85} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Faltas e conflitos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span>Faltas no mês</span>
            <Badge>4</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Conflitos de disponibilidade</span>
            <Badge variant="destructive">2</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Membros ativos</span>
            <Badge variant="outline">26</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Panorama rápido
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 grid-cols-1 md:grid-cols-3 text-sm">
          <div className="rounded-kerigma border border-border p-4">
            <div className="text-muted-foreground">Escalas do mês</div>
            <div className="text-2xl font-semibold">6</div>
          </div>
          <div className="rounded-kerigma border border-border p-4">
            <div className="text-muted-foreground">Ensaios marcados</div>
            <div className="text-2xl font-semibold">3</div>
          </div>
          <div className="rounded-kerigma border border-border p-4">
            <div className="text-muted-foreground">Músicas no repertório</div>
            <div className="text-2xl font-semibold">128</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
