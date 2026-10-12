"use server";
// Ações do portal. Toda mudança feita aqui é do Adriano (baixa nunca é automática).
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { timingSafeEqual } from "node:crypto";
import { banco, bancoConfigurado, registrarEvento } from "@/lib/banco";
import { COOKIE, criarToken } from "@/lib/sessao";

function exigeBanco() {
  if (!bancoConfigurado()) throw new Error("Modo demonstração: as ações não são gravadas.");
}

export async function entrar(_: unknown, form: FormData): Promise<{ erro: string } | void> {
  const senha = String(form.get("senha") ?? "");
  const certa = process.env.PORTAL_SENHA ?? "";
  const a = Buffer.from(senha);
  const b = Buffer.from(certa);
  if (!certa || a.length !== b.length || !timingSafeEqual(a, b)) return { erro: "Senha incorreta." };
  const { token, maxAge } = await criarToken();
  (await cookies()).set(COOKIE, token, { httpOnly: true, secure: true, sameSite: "lax", maxAge, path: "/" });
  redirect("/");
}

export async function sair() {
  (await cookies()).delete(COOKIE);
  redirect("/entrar");
}

export async function mudarPendencia(id: string, situacao: "aberta" | "feita" | "descartada" | "aguardando") {
  exigeBanco();
  const fechada = situacao === "feita" || situacao === "descartada";
  const { error } = await banco()
    .from("pendencias")
    .update({ situacao, motivo_conferir: null, ...(fechada ? { fechada_em: new Date().toISOString(), fechada_por: "adriano" } : {}) })
    .eq("id", id);
  if (error) throw error;
  await registrarEvento(`pendencia_${situacao}`, id);
  revalidatePath("/", "layout");
}

export async function confirmarContato(form: FormData) {
  exigeBanco();
  const id = String(form.get("id"));
  const nome = String(form.get("nome") ?? "").trim();
  const empresa = String(form.get("empresa") ?? "").trim() || null;
  if (!nome) throw new Error("Informe o nome.");
  const { error } = await banco().from("contatos").update({ nome, empresa, situacao: "confirmado", atualizado_em: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
  await registrarEvento("contato_confirmado", id);
  revalidatePath("/", "layout");
}

export async function arquivarContato(form: FormData) {
  exigeBanco();
  const id = String(form.get("id"));
  const { error } = await banco().from("contatos").update({ situacao: "arquivado" }).eq("id", id);
  if (error) throw error;
  await registrarEvento("contato_arquivado", id);
  revalidatePath("/", "layout");
}

export async function alternarControle(chave: "captura_ligada" | "analise_ligada", valor: boolean) {
  exigeBanco();
  const { error } = await banco().from("controles").upsert({ chave, valor, atualizado_em: new Date().toISOString() });
  if (error) throw error;
  await registrarEvento("controle", chave, { valor });
  revalidatePath("/sistema");
}

export async function novaPendencia(form: FormData) {
  exigeBanco();
  const titulo = String(form.get("titulo") ?? "").trim();
  if (!titulo) return;
  const prazo = String(form.get("prazo") ?? "") || null;
  const { error } = await banco().from("pendencias").insert({ titulo, quem_deve: "adriano", prazo_data: prazo, situacao: "aberta", origem: "adriano" });
  if (error) throw error;
  revalidatePath("/", "layout");
}
