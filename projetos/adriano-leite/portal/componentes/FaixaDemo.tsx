export function FaixaDemo({ ativo }: { ativo: boolean }) {
  if (!ativo) return null;
  return (
    <p className="demo" role="note">
      <strong>Modo demonstração.</strong> Dados fictícios, só para ver o portal funcionando. Nenhum nome ou número é real e nada é gravado.
    </p>
  );
}
