"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/", rotulo: "Hoje", d: "M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" },
  { href: "/conversas", rotulo: "Conversas", d: "M4 5h16v11H8l-4 4z" },
  { href: "/pendencias", rotulo: "Pendências", d: "M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" },
  { href: "/busca", rotulo: "Busca", d: "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5 21 21" },
  { href: "/sistema", rotulo: "Sistema", d: "M12 8v4l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" },
];

function ativo(path: string, href: string) {
  return href === "/" ? path === "/" : path.startsWith(href);
}

export function NavTopo() {
  const path = usePathname();
  return (
    <nav className="nav" aria-label="Principal">
      {ITENS.map((i) => (
        <Link key={i.href} href={i.href} aria-current={ativo(path, i.href) ? "page" : undefined}>
          {i.rotulo}
        </Link>
      ))}
    </nav>
  );
}

export function Abas() {
  const path = usePathname();
  return (
    <nav className="abas" aria-label="Principal">
      {ITENS.map((i) => (
        <Link key={i.href} href={i.href} aria-current={ativo(path, i.href) ? "page" : undefined}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={i.d} />
          </svg>
          {i.rotulo}
        </Link>
      ))}
    </nav>
  );
}
