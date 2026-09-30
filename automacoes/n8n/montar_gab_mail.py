"""Monta o workflow GAB-MAIL 1 (captura do e-mail contato@ → Notion) a partir dos
arquivos em codigo/. Saída: GAB-MAIL-1-captura-email.json, pronto para importar no
n8n (menu ··· → Import from File) ou para subir pela API com n8n_api.py.

Uso: python3 montar_gab_mail.py
"""
import json
import pathlib
import uuid

AQUI = pathlib.Path(__file__).parent
COD = AQUI / "codigo"

NOTION_CRED = {"notionApi": {"name": "n8n Ative"}}
IMAP_CRED = {"imap": {"name": "IMAP contato@ativeassessoriafinanceira.com.br"}}
ERRO_WORKFLOW = "QtrobngLSAoMtnjX"  # GAB-WPP 0 - Avisa quando quebra

# Data de corte da primeira leitura: só entra e-mail a partir deste dia.
# Depois o gatilho acompanha pelo UID e o dedup barra repetição.
CORTE = "2026-09-30"


def nid(nome):
    return str(uuid.uuid5(uuid.NAMESPACE_URL, "gab-mail-1/" + nome))


def codigo(nome, arquivo, pos):
    return {
        "id": nid(nome), "name": nome, "type": "n8n-nodes-base.code", "typeVersion": 2,
        "position": pos,
        "parameters": {"jsCode": (COD / arquivo).read_text(encoding="utf-8")},
    }


def codigo_inline(nome, js, pos):
    return {
        "id": nid(nome), "name": nome, "type": "n8n-nodes-base.code", "typeVersion": 2,
        "position": pos, "parameters": {"jsCode": js},
    }


def imap(nome, pasta, pos):
    return {
        "id": nid(nome), "name": nome, "type": "n8n-nodes-base.emailReadImap", "typeVersion": 2.1,
        "position": pos,
        "parameters": {
            "mailbox": pasta,
            # "nothing": não marca como lido nem move nada na caixa do Jonas
            "postProcessAction": "nothing",
            "format": "resolved",
            "downloadAttachments": False,
            "options": {
                "customEmailConfig": json.dumps([["SINCE", CORTE]]),
                "forceReconnect": 60,
            },
        },
        "credentials": IMAP_CRED,
    }


def notion(nome, metodo, url, corpo_expr, pos):
    return {
        "id": nid(nome), "name": nome, "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.2,
        "position": pos,
        "onError": "continueRegularOutput",
        "parameters": {
            "method": metodo,
            "url": url,
            "authentication": "predefinedCredentialType",
            "nodeCredentialType": "notionApi",
            "sendHeaders": True,
            "headerParameters": {"parameters": [{"name": "Notion-Version", "value": "2022-06-28"}]},
            "sendBody": True,
            "specifyBody": "json",
            "jsonBody": corpo_expr,
            "options": {},
        },
        "credentials": NOTION_CRED,
    }


def se(nome, campo, pos):
    return {
        "id": nid(nome), "name": nome, "type": "n8n-nodes-base.if", "typeVersion": 2.2,
        "position": pos,
        "parameters": {
            "conditions": {
                "options": {"caseSensitive": True, "leftValue": "", "typeValidation": "loose", "version": 2},
                "conditions": [{
                    "id": nid(nome + "/cond"),
                    "leftValue": "={{ $json." + campo + " }}",
                    "rightValue": "",
                    "operator": {"type": "boolean", "operation": "true", "singleValue": True},
                }],
                "combinator": "and",
            },
            "options": {},
        },
    }


marca = "return $input.all().map((i) => ({ json: { ...i.json, pasta: '%s' }, binary: i.binary }));"

nodes = [
    imap("IMAP - Caixa de entrada", "INBOX", [0, 0]),
    imap("IMAP - Enviados", "INBOX.Sent", [0, 220]),
    codigo_inline("Pasta: entrada", marca % "entrada", [220, 0]),
    codigo_inline("Pasta: enviados", marca % "enviados", [220, 220]),
    codigo("Config", "config-email.js", [440, 110]),
    codigo("Normaliza e-mail", "normaliza-email.js", [660, 110]),
    {
        "id": nid("Ja processei esse?"), "name": "Ja processei esse?",
        "type": "n8n-nodes-base.removeDuplicates", "typeVersion": 2, "position": [880, 110],
        "parameters": {
            "operation": "removeItemsSeenInPreviousExecutions",
            "dedupeValue": "={{ $json.messageId }}",
            "options": {},
        },
    },
    {
        "id": nid("Um por vez"), "name": "Um por vez",
        "type": "n8n-nodes-base.splitInBatches", "typeVersion": 3, "position": [1100, 110],
        "parameters": {"batchSize": 1, "options": {}},
    },
    notion(
        "Busca contato (Notion)", "POST",
        "=https://api.notion.com/v1/databases/{{ $json.cfg.crmDbId }}/query",
        "={{ JSON.stringify({ page_size: 5, filter: { or: ["
        "{ property: 'Email', email: { equals: $json.email } }, "
        "{ property: 'Email', email: { equals: $json.emailOriginal } } ] } }) }}",
        [1320, 200],
    ),
    codigo("Resolve contato", "resolve-contato.js", [1540, 200]),
    se("Cria contato?", "criarContato", [1760, 200]),
    notion(
        "Cria contato (Notion)", "POST", "https://api.notion.com/v1/pages",
        "={{ JSON.stringify($json.corpoContato) }}", [1980, 100],
    ),
    codigo("Monta registro", "monta-registro.js", [2200, 200]),
    notion(
        "Grava em Recebidas (Notion)", "POST", "https://api.notion.com/v1/pages",
        "={{ JSON.stringify($json.corpoRegistro) }}", [2420, 200],
    ),
    codigo("Confere gravação", "confere-gravacao.js", [2640, 200]),
    se("Atualiza contato?", "atualizarContato", [2860, 200]),
    notion(
        "Ultimo Contato (Notion)", "PATCH",
        "=https://api.notion.com/v1/pages/{{ $json.contatoId }}",
        "={{ JSON.stringify({ properties: { 'Último Contato': { date: { start: $json.dataSP } } } }) }}",
        [3080, 100],
    ),
    codigo_inline("Devolve resultado", "return [{ json: $('Confere gravação').first().json }];", [3300, 100]),
    codigo("Falhou algum?", "falhou-algum.js", [1320, -100]),
]


def liga(*pares):
    con = {}
    for origem, destino, saida in pares:
        blocos = con.setdefault(origem, {"main": []})["main"]
        while len(blocos) <= saida:
            blocos.append([])
        blocos[saida].append({"node": destino, "type": "main", "index": 0})
    return con


connections = liga(
    ("IMAP - Caixa de entrada", "Pasta: entrada", 0),
    ("IMAP - Enviados", "Pasta: enviados", 0),
    ("Pasta: entrada", "Config", 0),
    ("Pasta: enviados", "Config", 0),
    ("Config", "Normaliza e-mail", 0),
    ("Normaliza e-mail", "Ja processei esse?", 0),
    ("Ja processei esse?", "Um por vez", 0),
    # splitInBatches v3: saída 0 = terminou o lote, saída 1 = próximo item
    ("Um por vez", "Falhou algum?", 0),
    ("Um por vez", "Busca contato (Notion)", 1),
    ("Busca contato (Notion)", "Resolve contato", 0),
    ("Resolve contato", "Cria contato?", 0),
    ("Cria contato?", "Cria contato (Notion)", 0),
    ("Cria contato?", "Monta registro", 1),
    ("Cria contato (Notion)", "Monta registro", 0),
    ("Monta registro", "Grava em Recebidas (Notion)", 0),
    ("Grava em Recebidas (Notion)", "Confere gravação", 0),
    ("Confere gravação", "Atualiza contato?", 0),
    ("Atualiza contato?", "Ultimo Contato (Notion)", 0),
    ("Atualiza contato?", "Um por vez", 1),
    ("Ultimo Contato (Notion)", "Devolve resultado", 0),
    ("Devolve resultado", "Um por vez", 0),
)

workflow = {
    "name": "GAB-MAIL 1 - Captura e-mail contato@ (Notion)",
    "nodes": nodes,
    "connections": connections,
    "settings": {
        "executionOrder": "v1",
        "timezone": "America/Sao_Paulo",
        "errorWorkflow": ERRO_WORKFLOW,
        "saveManualExecutions": True,
        "callerPolicy": "workflowsFromSameOwner",
    },
    "pinData": {},
}

if __name__ == "__main__":
    destino = AQUI / "GAB-MAIL-1-captura-email.json"
    destino.write_text(json.dumps(workflow, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{destino.name}: {len(nodes)} nós")
