// Tradução do webhook da Z-API para o formato interno.
// Campos conferidos com o que a automação do Jonas recebeu em produção;
// conferir de novo com a documentação da Z-API ao ativar a instância do Adriano.

export type TipoMensagem = "texto" | "audio" | "imagem" | "documento" | "video" | "reacao" | "outro";

export type MensagemNormalizada = {
  provedor: "zapi";
  idExterno: string; // messageId: chave única no banco (impede duplicata na origem)
  instancia: string;
  deMim: boolean; // enviada pelo próprio Adriano
  momento: Date;
  telefone: string | null; // do outro lado da conversa (ou LID, se for o que veio)
  lid: string | null;
  nomePerfil: string | null;
  grupo: { id: string; nome: string | null; participanteTelefone: string | null; participanteLid: string | null } | null;
  tipo: TipoMensagem;
  texto: string | null;
  midia: { url: string; mime: string | null; nomeArquivo: string | null; segundos: number | null } | null;
  respondeA: string | null;
};

export type ResultadoNormalizacao =
  | { aceitar: true; mensagem: MensagemNormalizada }
  | { aceitar: false; motivo: string };

type Bruto = Record<string, any>;

export function normalizarZapi(p: Bruto, gruposPermitidos: Set<string> = new Set()): ResultadoNormalizacao {
  if (!p || typeof p !== "object") return { aceitar: false, motivo: "corpo vazio" };
  if (p.type && p.type !== "ReceivedCallback") return { aceitar: false, motivo: `callback ${p.type}` };
  if (!p.messageId) return { aceitar: false, motivo: "sem messageId" };
  if (p.isNewsletter || p.broadcast) return { aceitar: false, motivo: "canal/lista de transmissão" };
  if (p.fromApi) return { aceitar: false, motivo: "eco de envio pela API" };
  if (p.isGroup && !gruposPermitidos.has("*") && !gruposPermitidos.has(String(p.phone))) return { aceitar: false, motivo: "grupo fora da lista" };

  const momento = new Date(Number(p.momment ?? p.moment ?? Date.now()));
  const phone = p.phone ? String(p.phone) : null;
  const telefoneEhLid = !!phone && phone.includes("@lid");

  let tipo: TipoMensagem = "outro";
  let texto: string | null = null;
  let midia: MensagemNormalizada["midia"] = null;

  if (p.text?.message != null) {
    tipo = "texto";
    texto = String(p.text.message);
  } else if (p.audio?.audioUrl) {
    tipo = "audio";
    midia = { url: p.audio.audioUrl, mime: p.audio.mimeType ?? null, nomeArquivo: null, segundos: p.audio.seconds ?? null };
  } else if (p.image?.imageUrl) {
    tipo = "imagem";
    texto = p.image.caption ?? null;
    midia = { url: p.image.imageUrl, mime: p.image.mimeType ?? null, nomeArquivo: null, segundos: null };
  } else if (p.document?.documentUrl) {
    tipo = "documento";
    texto = p.document.caption ?? p.document.title ?? null;
    midia = { url: p.document.documentUrl, mime: p.document.mimeType ?? null, nomeArquivo: p.document.fileName ?? null, segundos: null };
  } else if (p.video?.videoUrl) {
    tipo = "video";
    texto = p.video.caption ?? null;
    midia = { url: p.video.videoUrl, mime: p.video.mimeType ?? null, nomeArquivo: null, segundos: p.video.seconds ?? null };
  } else if (p.reaction?.value) {
    tipo = "reacao";
    texto = String(p.reaction.value);
  }

  return {
    aceitar: true,
    mensagem: {
      provedor: "zapi",
      idExterno: String(p.messageId),
      instancia: String(p.instanceId ?? ""),
      deMim: !!p.fromMe,
      momento,
      telefone: p.isGroup ? null : telefoneEhLid ? null : phone,
      lid: p.isGroup ? null : telefoneEhLid ? phone : p.chatLid ?? null,
      nomePerfil: p.fromMe ? (p.chatName ?? null) : (p.senderName ?? p.chatName ?? null),
      grupo: p.isGroup
        ? { id: String(p.phone), nome: p.chatName ?? null, participanteTelefone: p.participantPhone ?? null, participanteLid: p.participantLid ?? null }
        : null,
      tipo,
      texto,
      midia,
      respondeA: p.referenceMessageId ?? p.reaction?.referencedMessage?.messageId ?? null,
    },
  };
}
