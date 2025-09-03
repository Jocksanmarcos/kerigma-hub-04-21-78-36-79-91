import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FilterBar } from "@/components/filters/FilterBar";

interface Props {
  values: {
    search?: string;
    situacao?: string;
    estado_espiritual?: string;
    discipulador_id?: string;
    tags?: string[];
  };
  onChange: (key: keyof Props["values"], value: any) => void;
  onClear?: () => void;
}

export const PessoasFiltersBar: React.FC<Props> = ({ values, onChange, onClear }) => {
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [nivelOptions, setNivelOptions] = useState<string[]>([]);
  const [discipuladores, setDiscipuladores] = useState<{ id: string; nome: string }[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    const loadOptions = async () => {
      // Distinct situacao
      const { data: statRows } = await supabase
        .from("pessoas")
        .select("situacao")
        .not("situacao", "is", null)
        .limit(500);
      setStatusOptions(Array.from(new Set((statRows || []).map((r: any) => r.situacao))).filter(Boolean));

      // Distinct estado_espiritual
      const { data: nivelRows } = await supabase
        .from("pessoas")
        .select("estado_espiritual")
        .not("estado_espiritual", "is", null)
        .limit(500);
      setNivelOptions(Array.from(new Set((nivelRows || []).map((r: any) => r.estado_espiritual))).filter(Boolean));

      // Discipuladores list (leaders first, fallback all)
      const { data: discRows } = await supabase
        .from("pessoas")
        .select("id, nome_completo")
        .order("nome_completo", { ascending: true })
        .limit(500);
      setDiscipuladores(
        (discRows || []).map((p: any) => ({ id: p.id, nome: p.nome_completo }))
      );

      // Tags não estão disponíveis na tabela pessoas
      setAllTags([]);
    };
    loadOptions();
  }, []);

  const tagString = useMemo(() => (values.tags || []).join(","), [values.tags]);

  return (
    <FilterBar>
      <div className="flex-1 min-w-[220px]">
        <Input
          placeholder="Buscar por nome ou email..."
          value={values.search || ""}
          onChange={(e) => onChange("search", e.target.value)}
        />
      </div>

      <Select value={values.situacao || "all"} onValueChange={(v) => onChange("situacao", v === "all" ? "" : v)}>
        <SelectTrigger className="w-[220px]"><SelectValue placeholder="Situação" /></SelectTrigger>
        <SelectContent className="z-50 bg-popover">
          <SelectItem value="all">Todos</SelectItem>
          {statusOptions.map((opt) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={values.estado_espiritual || "all"} onValueChange={(v) => onChange("estado_espiritual", v === "all" ? "" : v)}>
        <SelectTrigger className="w-[200px]"><SelectValue placeholder="Estado espiritual" /></SelectTrigger>
        <SelectContent className="z-50 bg-popover">
          <SelectItem value="all">Todos</SelectItem>
          {nivelOptions.map((opt) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={values.discipulador_id || "all"} onValueChange={(v) => onChange("discipulador_id", v === "all" ? "" : v)}>
        <SelectTrigger className="w-[260px]"><SelectValue placeholder="Discipulador" /></SelectTrigger>
        <SelectContent className="z-50 bg-popover">
          <SelectItem value="all">Todos</SelectItem>
          {discipuladores.map((d) => (
            <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="min-w-[240px]">
        <Input
          placeholder="Tags (separe por vírgula)"
          value={tagString}
          onChange={(e) => onChange("tags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
          list="pessoas-tags"
        />
        {/* provide datalist for quick tag suggestions */}
        <datalist id="pessoas-tags">
          {allTags.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </div>

      {onClear && (
        <Button variant="outline" onClick={onClear} className="ml-auto">
          <Filter className="h-4 w-4 mr-2" />
          Limpar filtros
        </Button>
      )}
    </FilterBar>
  );
};

export default PessoasFiltersBar;
