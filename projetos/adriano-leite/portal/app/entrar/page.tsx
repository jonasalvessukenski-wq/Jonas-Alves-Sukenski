"use client";
import { useActionState } from "react";
import { entrar } from "@/app/acoes";

export default function Entrar() {
  const [estado, acao, pendente] = useActionState(entrar, undefined);
  return (
    <div className="entrar">
      <form action={acao}>
        <p className="rotulo">Gabinete</p>
        <h1>Adriano Leite</h1>
        <div className="campo">
          <label htmlFor="senha">Senha</label>
          <input id="senha" name="senha" type="password" className="entrada" autoComplete="current-password" required autoFocus />
        </div>
        <button className="botao primario" disabled={pendente}>Entrar</button>
        {estado?.erro && <p className="ruim" role="alert">{estado.erro}</p>}
      </form>
    </div>
  );
}
