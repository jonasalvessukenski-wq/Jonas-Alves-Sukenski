// Chamado pelo Vercel Cron a cada minuto (ver vercel.json).
import { NextResponse } from "next/server";
import { processarFila } from "@/lib/processador";

export const maxDuration = 60;

export async function GET(req: Request) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo || req.headers.get("authorization") !== `Bearer ${segredo}`) {
    return new NextResponse(null, { status: 401 });
  }
  const resumo = await processarFila();
  return NextResponse.json(resumo);
}
