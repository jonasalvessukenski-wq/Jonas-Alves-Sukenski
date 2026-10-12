import Link from "next/link";
import type { Pendencia as P } from "@/lib/dados";
import { prazo } from "./formato";
import { AcoesPendencia } from "./AcoesPendencia";

export function ItemPendencia({ p, demo, mostrarContato = true }: { p: P; demo: boolean; mostrarContato?: boolean }) {
  const pz = prazo(p.prazoData, p.prazoHora);
  return (
    <li className="pend">
      <div className="pend-topo">
        <span className="pend-titulo">{p.titulo}</span>
        {p.situacao === "conferir" ? <span className="etiqueta conferir">conferir</span> : pz ? <span className={`etiqueta ${pz.classe}`}>{pz.texto}</span> : null}
      </div>
      {mostrarContato && p.contatoNome && (
        <span className="sutil">{p.contatoId ? <Link href={`/conversas/${p.contatoId}`}>{p.contatoNome}</Link> : p.contatoNome}</span>
      )}
      {p.evidencias[0] && <p className="pend-evid">“{p.evidencias[0]}”</p>}
      {p.motivoConferir && <span className="pend-motivo">Por que conferir: {p.motivoConferir}</span>}
      <AcoesPendencia id={p.id} situacao={p.situacao} demo={demo} />
    </li>
  );
}
