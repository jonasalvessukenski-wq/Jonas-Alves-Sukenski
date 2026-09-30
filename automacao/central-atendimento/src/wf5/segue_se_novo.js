// Descarta o que a Z-API reenviou (mesmo messageId já gravado)
const m = $('Normaliza (Business)').first().json;
const b = $input.first().json || {};
if ((b.results || []).length) return [];
return [{ json: m }];
