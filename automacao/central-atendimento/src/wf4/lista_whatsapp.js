// Envios por WhatsApp que o Notion confirmou como "enviada" no passo anterior
return listaEnvios($('Travas').all(), $('Grava travas').all(), (e) => e.canal !== 'E-mail');
