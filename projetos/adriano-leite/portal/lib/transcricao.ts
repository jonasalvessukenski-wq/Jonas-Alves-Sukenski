// Transcrição de áudio. A API do Claude não transcreve áudio; usamos um serviço
// compatível com o endpoint /audio/transcriptions (OpenAI Whisper, Groq e outros).
// Provedor a definir com o Jonas [CONFIRMAR]: configure TRANSCRICAO_URL e TRANSCRICAO_CHAVE.

export async function transcreverAudio(arquivo: Blob, mime: string): Promise<string> {
  const url = process.env.TRANSCRICAO_URL; // ex.: https://api.openai.com/v1/audio/transcriptions
  const chave = process.env.TRANSCRICAO_CHAVE;
  const modelo = process.env.TRANSCRICAO_MODELO ?? "whisper-1";
  if (!url || !chave) throw Object.assign(new Error("transcrição não configurada"), { status: 400 });

  const extensao = mime.includes("mpeg") ? "mp3" : mime.includes("mp4") ? "m4a" : "ogg";
  const form = new FormData();
  form.append("file", new File([arquivo], `audio.${extensao}`, { type: mime }));
  form.append("model", modelo);
  form.append("language", "pt");

  const resp = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${chave}` }, body: form });
  if (!resp.ok) throw Object.assign(new Error(`transcrição ${resp.status}`), { status: resp.status });
  const json = (await resp.json()) as { text?: string };
  return (json.text ?? "").trim();
}
