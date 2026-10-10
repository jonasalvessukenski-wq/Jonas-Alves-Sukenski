"use client";
import { useTransition, useState } from "react";
import { mudarPendencia } from "@/app/acoes";

export function AcoesPendencia({ id, situacao, demo }: { id: string; situacao: string; demo: boolean }) {
  const [pendente, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const agir = (s: "aberta" | "feita" | "descartada") =>
    iniciar(async () => {
      setErro(null);
      try { await mudarPendencia(id, s); } catch (e) { setErro(e instanceof Error ? e.message : "Erro"); }
    });
  return (
    <div className="acoes">
      {situacao === "conferir" ? (
        <>
          <button className="botao primario" disabled={pendente || demo} onClick={() => agir("aberta")}>Confirmar</button>
          <button className="botao" disabled={pendente || demo} onClick={() => agir("descartada")}>Não é pendência</button>
        </>
      ) : (
        <>
          <button className="botao" disabled={pendente || demo} onClick={() => agir("feita")}>Concluir</button>
          <button className="botao" disabled={pendente || demo} onClick={() => agir("descartada")}>Descartar</button>
        </>
      )}
      {erro && <span className="sutil ruim" role="alert">{erro}</span>}
    </div>
  );
}
