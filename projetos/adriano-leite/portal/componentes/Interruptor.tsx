"use client";
import { useTransition } from "react";
import { alternarControle } from "@/app/acoes";

export function Interruptor({ chave, ligado, rotulo, descricao, demo }: { chave: "captura_ligada" | "analise_ligada"; ligado: boolean; rotulo: string; descricao: string; demo: boolean }) {
  const [pendente, iniciar] = useTransition();
  return (
    <div className="interruptor">
      <div><h3>{rotulo}</h3><span className="sutil">{descricao}</span></div>
      <button
        className={`botao${ligado ? "" : " primario"}`}
        aria-pressed={ligado}
        disabled={pendente || demo}
        onClick={() => iniciar(() => alternarControle(chave, !ligado))}
      >
        {ligado ? "Desligar" : "Ligar"}
      </button>
    </div>
  );
}
