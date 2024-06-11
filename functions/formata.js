/**
 * Formata valores diversos.
 * formata(12.3, 'BRL');
 * formata(0.5, '['porcentagem', 'negativo']);
 * @param {*} valor - Valor a ser formatado
 * @param {string|array} opcoes - Formatações a serem executadas
 * @returns
 */
export function formata(valor, opcoes) {
  let formatado = "";
  if (typeof opcoes == "string") opcoes = [opcoes];
  opcoes.forEach((opcao) => {
    switch (opcao) {
      /**
       * Moeda BRL: R$ 1.234,56
       */
      case "BRL":
        formatado = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
          currencySign: "accounting",
        }).format(valor);
        break;
      /**
       * Número: 1,23
       */
      case "numero":
        formatado = new Intl.NumberFormat("pt-BR", {
          style: "decimal",
        }).format(valor);
        break;
      /**
       * Porcentagem: 0,50%
       */
      case "porcentagem":
        formatado = new Intl.NumberFormat("pt-BR", {
          style: "percent",
          minimumFractionDigits: 2,
        }).format(valor / 100);
        break;
      /**
       * Negativo: texto em vermelho
       */
      case "negativo":
        if (valor < 0)
          formatado = `<span class="text-danger">${formatado}</span>`;
        break;
    }
  });
  return formatado;
}
