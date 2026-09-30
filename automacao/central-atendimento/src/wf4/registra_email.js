// Registra cada envio por e-mail: fila (ID ou falha), conversa em Recebidas, CRM e prospecção
return registraEnvios($('Lista e-mail').all().map((i) => i.json), $input.all().map((i) => i.json));
