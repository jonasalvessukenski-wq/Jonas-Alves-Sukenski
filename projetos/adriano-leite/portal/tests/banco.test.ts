// Roda a migração num Postgres em memória (PGlite) com um esboço do esquema
// `auth` do Supabase, e confere as garantias que o banco precisa dar.
import { describe, it, expect, beforeAll } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
import { readFileSync } from "node:fs";

let db: PGlite;

beforeAll(async () => {
  db = new PGlite({ extensions: { pg_trgm } });
  await db.exec(`
    create role authenticated;
    create schema auth;
    create function auth.uid() returns uuid language sql as $$ select null::uuid $$;
  `);
  await db.exec(readFileSync(new URL("../supabase/migrations/0001_estrutura.sql", import.meta.url), "utf8"));
}, 30000);

describe("migração", () => {
  it("mensagem repetida é barrada pelo banco", async () => {
    const ins = `insert into mensagens (canal, id_externo, de_mim, momento, tipo, texto) values ('whatsapp','M1',false,now(),'texto','oi')`;
    await db.exec(ins);
    await expect(db.exec(ins)).rejects.toThrow(/duplicate key/);
  });

  it("o mesmo trabalho não entra duas vezes na fila, mas pode ser refeito depois", async () => {
    await db.exec(`insert into trabalhos (tipo, alvo) values ('analisar_conversa','c1')`);
    await expect(db.exec(`insert into trabalhos (tipo, alvo) values ('analisar_conversa','c1')`)).rejects.toThrow(/duplicate key/);
    await db.exec(`update trabalhos set estado='feito' where alvo='c1'`);
    await db.exec(`insert into trabalhos (tipo, alvo) values ('analisar_conversa','c1')`);
  });

  it("pegar_trabalhos marca como processando e conta a tentativa", async () => {
    const r = await db.query<{ estado: string; tentativas: number }>(`select * from pegar_trabalhos(10)`);
    expect(r.rows.length).toBeGreaterThan(0);
    expect(r.rows.every((x) => x.estado === "processando" && x.tentativas === 1)).toBe(true);
  });

  it("fundir_contatos move mensagens e identificadores", async () => {
    const a = (await db.query<{ id: string }>(`insert into contatos (nome) values ('A') returning id`)).rows[0].id;
    const b = (await db.query<{ id: string }>(`insert into contatos default values returning id`)).rows[0].id;
    await db.query(`insert into contato_lids (lid, contato_id) values ('777', $1)`, [b]);
    await db.query(`insert into mensagens (canal, id_externo, contato_id, de_mim, momento, tipo) values ('whatsapp','M2',$1,false,now(),'texto')`, [b]);
    await db.query(`select fundir_contatos($1, $2)`, [b, a]);
    const lid = await db.query<{ contato_id: string }>(`select contato_id from contato_lids where lid='777'`);
    const msg = await db.query<{ contato_id: string }>(`select contato_id from mensagens where id_externo='M2'`);
    expect([lid.rows[0].contato_id, msg.rows[0].contato_id]).toEqual([a, a]);
    expect((await db.query(`select 1 from contatos where id=$1`, [b])).rows).toHaveLength(0);
  });

  it("baixa de pendência só pode ser do Adriano", async () => {
    await expect(db.exec(`insert into pendencias (titulo, quem_deve, origem, situacao, fechada_por) values ('x','adriano','ia','feita','ia')`)).rejects.toThrow(/check/);
  });

  it("envio automático começa desligado", async () => {
    const r = await db.query<{ valor: boolean }>(`select valor from controles where chave='envio_automatico'`);
    expect(r.rows[0].valor).toBe(false);
  });
});
