// Config — constantes do fluxo GAB-MAIL 1. Nenhuma senha aqui: a senha do e-mail
// mora só na credencial IMAP do n8n.
const cfg = {
  caixa: 'contato@ativeassessoriafinanceira.com.br',
  fuso: 'America/Sao_Paulo',
  // Bases do Notion (API 2022-06-28 usa o id da base, não o do data source)
  recebidasDbId: 'a62d9649-5d3d-4863-97f2-7b5d8b6dfc81',
  crmDbId: '4e84cf3d-6285-83f3-b094-81990f3dd072',
  // Domínios de e-mail pessoal: o cadastro novo leva "(e-mail)" em vez do domínio
  dominiosGenericos: [
    'gmail.com', 'hotmail.com', 'outlook.com', 'live.com', 'yahoo.com',
    'yahoo.com.br', 'icloud.com', 'uol.com.br', 'bol.com.br', 'terra.com.br',
  ],
  maxConteudo: 1900, // limite do Notion é 2000 por bloco de texto
};

return $input.all().map((item) => ({ json: { ...item.json, cfg }, binary: item.binary }));
