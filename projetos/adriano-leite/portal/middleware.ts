import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, protecaoAtiva, tokenValido } from "@/lib/sessao";

export async function middleware(req: NextRequest) {
  if (!protecaoAtiva()) return NextResponse.next(); // modo demonstração local
  if (await tokenValido(req.cookies.get(COOKIE)?.value)) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/entrar";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  // Webhook e processador têm segredo próprio; /entrar e arquivos estáticos ficam livres.
  matcher: ["/((?!api/webhooks|api/processar|entrar|_next|favicon.ico|icone.svg|manifest.webmanifest).*)"],
};
