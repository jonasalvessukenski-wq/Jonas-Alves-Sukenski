// Entrada do WhatsApp. Faz o mínimo e responde rápido:
// confere segredo e instância → normaliza → grava (o banco barra repetida) → enfileira.
// Qualquer processamento pesado acontece depois, no /api/processar.
import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { banco, enfileirar, lerControle, registrarEvento } from "@/lib/banco";
import { normalizarZapi } from "@/lib/zapi";

function igual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function POST(req: Request, ctx: { params: Promise<{ segredo: string }> }) {
  const { segredo } = await ctx.params;
  const esperado = process.env.WEBHOOK_SEGREDO;
  if (!esperado || !igual(segredo, esperado)) return new NextResponse(null, { status: 404 });

  const corpo = await req.json().catch(() => null);
  if (process.env.ZAPI_INSTANCIA && corpo?.instanceId !== process.env.ZAPI_INSTANCIA) {
    await registrarEvento("descartada", null, { motivo: "instância diferente" });
    return NextResponse.json({ ok: true });
  }
  if (!(await lerControle("captura_ligada", true))) return NextResponse.json({ ok: true, desligada: true });

  const grupos = new Set(await lerControle<string[]>("grupos_permitidos", []));
  const r = normalizarZapi(corpo, grupos);
  if (!r.aceitar) {
    // Registra só o motivo, nunca o conteúdo (LGPD).
    await registrarEvento("descartada", null, { motivo: r.motivo });
    return NextResponse.json({ ok: true });
  }

  const m = r.mensagem;
  const { data, error } = await banco()
    .from("mensagens")
    .upsert(
      {
        canal: "whatsapp",
        id_externo: m.idExterno,
        de_mim: m.deMim,
        momento: m.momento.toISOString(),
        tipo: m.tipo,
        texto: m.texto,
        midia_mime: m.midia?.mime ?? null,
        grupo_id: m.grupo?.id ?? null,
        bruto: corpo,
      },
      { onConflict: "canal,id_externo", ignoreDuplicates: true },
    )
    .select("id");
  if (error) {
    // 500 faz a Z-API reenviar; a mensagem não se perde em silêncio.
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  if (data && data.length > 0) {
    await enfileirar("identificar", data[0].id);
    await registrarEvento("recebida", data[0].id, { tipo: m.tipo, de_mim: m.deMim });
  }
  return NextResponse.json({ ok: true });
}
