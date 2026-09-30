// Registra cada envio por WhatsApp: fila (ID ou falha), conversa em Recebidas, CRM e prospecção
return registraEnvios($('Lista WhatsApp').all().map((i) => i.json), $input.all().map((i) => i.json));
