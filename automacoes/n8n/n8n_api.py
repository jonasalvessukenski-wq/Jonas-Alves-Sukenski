"""Utilitário mínimo para a API pública do n8n Cloud da Ative.

Lê a chave de N8N_API_KEY (variável de ambiente; nunca no código nem no repositório).
Cópias baixadas vão para backups/, que está no .gitignore: workflows carregam tokens
(ex.: o da Z-API no GAB-WPP 2) e não podem ir para o git.

  python3 n8n_api.py listar
  python3 n8n_api.py baixar <id>
  python3 n8n_api.py subir-novo <arquivo.json> [--imap-cred-id ID]
  python3 n8n_api.py atualizar <id> <arquivo.json>
  python3 n8n_api.py reativar <id>
  python3 n8n_api.py execucoes <id> [quantas]
"""
import datetime
import json
import os
import pathlib
import sys
import urllib.error
import urllib.request

BASE = os.environ.get("N8N_URL", "https://ativeassessoriafinanceir.app.n8n.cloud").rstrip("/")
AQUI = pathlib.Path(__file__).parent
BACKUPS = AQUI / "backups"
GAB_WPP_1 = "IJLPj2CoZmrGomw0"
CAMPOS_PUT = ("name", "nodes", "connections", "settings", "staticData")


def api(metodo, caminho, corpo=None):
    chave = os.environ.get("N8N_API_KEY")
    if not chave:
        sys.exit("Falta N8N_API_KEY no ambiente.")
    req = urllib.request.Request(
        f"{BASE}/api/v1{caminho}", method=metodo,
        data=json.dumps(corpo).encode() if corpo is not None else None,
        headers={"X-N8N-API-KEY": chave, "Content-Type": "application/json", "Accept": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            txt = r.read().decode()
            return json.loads(txt) if txt else {}
    except urllib.error.HTTPError as e:
        sys.exit(f"{metodo} {caminho} -> {e.code}: {e.read().decode()[:500]}")


def baixar(wid):
    w = api("GET", f"/workflows/{wid}")
    BACKUPS.mkdir(exist_ok=True)
    carimbo = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    destino = BACKUPS / f"{wid}-{carimbo}.json"
    destino.write_text(json.dumps(w, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{w['name']} ({len(w['nodes'])} nós, ativo={w.get('active')}) -> {destino}")
    return w


def reativar(wid):
    # PATCH/PUT num workflow ativo não recarrega a versão em produção (armadilha de
    # 20/09): sempre desativar e reativar depois de alterar.
    api("POST", f"/workflows/{wid}/deactivate")
    api("POST", f"/workflows/{wid}/activate")
    print(f"{wid}: desativado e reativado")


def credencial_notion():
    # Reaproveita a credencial do Notion que o GAB-WPP 1 já usa
    for n in api("GET", f"/workflows/{GAB_WPP_1}")["nodes"]:
        cred = (n.get("credentials") or {}).get("notionApi")
        if cred and cred.get("id"):
            return cred
    return None


def subir_novo(arquivo, imap_id=None):
    w = json.loads(pathlib.Path(arquivo).read_text(encoding="utf-8"))
    notion = credencial_notion()
    for n in w["nodes"]:
        creds = n.get("credentials") or {}
        if "notionApi" in creds and notion:
            creds["notionApi"] = notion
        if "imap" in creds and imap_id:
            creds["imap"] = {"id": imap_id, "name": creds["imap"]["name"]}
    novo = api("POST", "/workflows", {k: w[k] for k in ("name", "nodes", "connections", "settings")})
    print(f"criado: {novo['name']} id={novo['id']} (inativo; ativar depois de conferir)")


def atualizar(wid, arquivo):
    baixar(wid)  # cópia de segurança antes de qualquer mudança
    w = json.loads(pathlib.Path(arquivo).read_text(encoding="utf-8"))
    api("PUT", f"/workflows/{wid}", {k: w[k] for k in CAMPOS_PUT if k in w})
    atual = api("GET", f"/workflows/{wid}")
    if atual.get("active"):
        reativar(wid)
    print(f"{wid}: atualizado")


def execucoes(wid, quantas=10):
    r = api("GET", f"/executions?workflowId={wid}&limit={quantas}")
    for e in r.get("data", []):
        print(e["id"], e.get("status"), e.get("startedAt"), e.get("mode"))


if __name__ == "__main__":
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__)
    cmd = a[0]
    if cmd == "listar":
        for w in api("GET", "/workflows?limit=100")["data"]:
            print(w["id"], "ATIVO " if w["active"] else "inativo", w["name"])
    elif cmd == "baixar":
        baixar(a[1])
    elif cmd == "subir-novo":
        imap = a[a.index("--imap-cred-id") + 1] if "--imap-cred-id" in a else None
        subir_novo(a[1], imap)
    elif cmd == "atualizar":
        atualizar(a[1], a[2])
    elif cmd == "reativar":
        reativar(a[1])
    elif cmd == "execucoes":
        execucoes(a[1], int(a[2]) if len(a) > 2 else 10)
    else:
        sys.exit(__doc__)
