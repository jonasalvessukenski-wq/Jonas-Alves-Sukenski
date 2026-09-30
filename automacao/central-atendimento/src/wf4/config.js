// Lê a base "Controles da central" e devolve as chaves ligadas/desligadas e os valores
const cfg = lerControles($input.all().map((i) => i.json));
return [{ json: { cfg } }];
