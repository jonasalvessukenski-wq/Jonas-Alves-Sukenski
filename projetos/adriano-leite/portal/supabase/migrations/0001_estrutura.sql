-- Portal do Adriano Leite — estrutura do banco (Supabase / Postgres).
-- Princípios: a mensagem é gravada ANTES de qualquer processamento;
-- unicidade garantida pelo banco (não por código); nada é sobrescrito,
-- só acrescentado; todo passo deixa rastro em `eventos`.

create extension if not exists pg_trgm;

-- Contatos ---------------------------------------------------------------
create table contatos (
  id            uuid primary key default gen_random_uuid(),
  nome          text,                         -- confirmado pelo Adriano; null = pendente
  empresa       text,
  apelido_perfil text,                        -- nome do perfil do WhatsApp: só pista
  situacao      text not null default 'pendente' check (situacao in ('pendente','confirmado','arquivado')),
  contexto      text,                         -- notas curtas que a IA recebe como contexto
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table contato_telefones (
  chave       text primary key,               -- 55 + DDD + últimos 8 dígitos (ver lib/telefone.ts)
  e164        text not null,
  contato_id  uuid not null references contatos(id) on delete cascade
);

create table contato_lids (
  lid         text primary key,
  contato_id  uuid not null references contatos(id) on delete cascade
);

create table contato_emails (
  email       text primary key check (email = lower(email)),
  contato_id  uuid not null references contatos(id) on delete cascade
);

-- Mensagens --------------------------------------------------------------
create table mensagens (
  id            uuid primary key default gen_random_uuid(),
  canal         text not null check (canal in ('whatsapp','email','reuniao')),
  id_externo    text not null,                -- messageId da Z-API / Message-ID do e-mail
  contato_id    uuid references contatos(id) on delete set null,
  de_mim        boolean not null,
  momento       timestamptz not null,
  tipo          text not null,
  texto         text,
  transcricao   text,                         -- áudio transcrito (nunca sobrescreve `texto`)
  midia_path    text,                         -- arquivo no Storage (a URL do provedor expira)
  midia_mime    text,
  grupo_id      text,
  analisada_em  timestamptz,                  -- null = ainda não entrou numa análise
  bruto         jsonb,                        -- corpo original, apagado após `retencao_bruto_dias`
  criado_em     timestamptz not null default now(),
  unique (canal, id_externo)                  -- duplicata barrada pelo banco
);
create index on mensagens (contato_id, momento desc);
create index on mensagens (contato_id) where analisada_em is null;
create index mensagens_busca on mensagens using gin ((coalesce(texto,'') || ' ' || coalesce(transcricao,'')) gin_trgm_ops);

-- Fila de trabalho (substitui o "nó tolerante a erro" que escondia falha) --
create table trabalhos (
  id            bigint generated always as identity primary key,
  tipo          text not null check (tipo in ('identificar','baixar_midia','transcrever','analisar_conversa','resumir_reuniao','despacho')),
  alvo          text not null,                -- id da mensagem, do contato ou da reunião
  estado        text not null default 'aguardando' check (estado in ('aguardando','processando','feito','morta')),
  tentativas    int not null default 0,
  tentar_em     timestamptz not null default now(),
  ultimo_erro   text,
  criado_em     timestamptz not null default now(),
  feito_em      timestamptz
);
create index on trabalhos (estado, tentar_em);
-- Um mesmo trabalho não fica duas vezes na fila ao mesmo tempo.
create unique index trabalhos_unico_ativo on trabalhos (tipo, alvo) where estado in ('aguardando','processando');

-- Análises e pendências --------------------------------------------------
create table analises (
  id            uuid primary key default gen_random_uuid(),
  contato_id    uuid not null references contatos(id) on delete cascade,
  mensagens     uuid[] not null,
  resumo        text not null,
  trilha        text not null check (trilha in ('trabalho','pessoal','ruido')),
  urgencia      text not null check (urgencia in ('hoje','semana','rotina','silencio')),
  deve_resposta boolean not null,
  modelo        text not null,
  tokens_entrada int not null,
  tokens_saida  int not null,
  criado_em     timestamptz not null default now()
);

create table pendencias (
  id            uuid primary key default gen_random_uuid(),
  contato_id    uuid references contatos(id) on delete set null,
  titulo        text not null,
  quem_deve     text not null check (quem_deve in ('adriano','contato','terceiro')),
  prazo_data    date,
  prazo_hora    time,
  situacao      text not null default 'aberta' check (situacao in ('conferir','aberta','aguardando','feita','descartada')),
  motivo_conferir text,
  origem        text not null check (origem in ('ia','adriano')),
  criado_em     timestamptz not null default now(),
  fechada_em    timestamptz,
  fechada_por   text check (fechada_por in ('adriano')) -- baixa nunca é automática
);
create index on pendencias (situacao, prazo_data);
create index on pendencias (contato_id) where situacao in ('conferir','aberta','aguardando');

-- Evidências: cada pendência guarda os trechos literais que a sustentam.
create table evidencias (
  id            bigint generated always as identity primary key,
  pendencia_id  uuid not null references pendencias(id) on delete cascade,
  mensagem_id   uuid references mensagens(id) on delete set null,
  trecho        text not null,
  criado_em     timestamptz not null default now()
);

-- Reuniões (agenda + transcrição/resumo) ---------------------------------
create table reunioes (
  id            uuid primary key default gen_random_uuid(),
  id_externo    text unique,                  -- id do evento no calendário
  titulo        text not null,
  inicio        timestamptz not null,
  fim           timestamptz,
  participantes jsonb not null default '[]',
  link          text,
  transcricao   text,
  resumo        text,
  decisoes      jsonb,
  criado_em     timestamptz not null default now()
);

-- Rastro e controles ----------------------------------------------------
create table eventos (
  id            bigint generated always as identity primary key,
  momento       timestamptz not null default now(),
  tipo          text not null,                -- recebida, descartada, identificada, fundiu, analisou, falhou, morta, ...
  alvo          text,
  detalhe       jsonb
);
create index on eventos (momento desc);

create table controles (
  chave         text primary key,
  valor         jsonb not null,
  atualizado_em timestamptz not null default now()
);
insert into controles (chave, valor) values
  ('captura_ligada', 'true'),                 -- botão de desligar
  ('analise_ligada', 'true'),
  ('envio_automatico', 'false'),              -- nada sai sem "pode enviar"
  ('grupos_permitidos', '[]'),
  ('retencao_bruto_dias', '30'),
  ('alerta_silencio_horas', '3');             -- sem mensagem em horário comercial = alerta

-- Segurança: só o dono acessa. O webhook e o processador usam a service key.
alter table contatos enable row level security;
alter table contato_telefones enable row level security;
alter table contato_lids enable row level security;
alter table contato_emails enable row level security;
alter table mensagens enable row level security;
alter table trabalhos enable row level security;
alter table analises enable row level security;
alter table pendencias enable row level security;
alter table evidencias enable row level security;
alter table reunioes enable row level security;
alter table eventos enable row level security;
alter table controles enable row level security;

-- Política: usuários autenticados listados em `donos` leem e editam.
create table donos (user_id uuid primary key);
alter table donos enable row level security;

do $$
declare t text;
begin
  foreach t in array array['contatos','contato_telefones','contato_lids','contato_emails','mensagens',
    'trabalhos','analises','pendencias','evidencias','reunioes','eventos','controles']
  loop
    execute format('create policy dono_%1$s on %1$I for all to authenticated
      using (exists (select 1 from donos where user_id = auth.uid()))
      with check (exists (select 1 from donos where user_id = auth.uid()))', t);
  end loop;
end $$;

-- Fusão de contatos (usada quando o par telefone/LID é aprendido).
create or replace function fundir_contatos(p_origem uuid, p_destino uuid) returns void
language plpgsql security definer as $$
begin
  update mensagens set contato_id = p_destino where contato_id = p_origem;
  update pendencias set contato_id = p_destino where contato_id = p_origem;
  update analises set contato_id = p_destino where contato_id = p_origem;
  update contato_telefones set contato_id = p_destino where contato_id = p_origem;
  update contato_lids set contato_id = p_destino where contato_id = p_origem;
  update contato_emails set contato_id = p_destino where contato_id = p_origem;
  insert into eventos (tipo, alvo, detalhe) values ('fundiu', p_destino::text, jsonb_build_object('origem', p_origem));
  delete from contatos where id = p_origem;
end $$;

-- Pega o próximo lote de trabalhos sem que dois processadores peguem o mesmo.
create or replace function pegar_trabalhos(qtd int) returns setof trabalhos
language sql as $$
  update trabalhos set estado = 'processando', tentativas = tentativas + 1
  where id in (
    select id from trabalhos
    where estado = 'aguardando' and tentar_em <= now()
    order by tentar_em
    limit qtd
    for update skip locked
  )
  returning *;
$$;
