/**
 * Formata valores diversos.
 * @param {*} valor - Valor a ser formatado
 * @param {string|array} opcoes - Formatações a serem executadas
 * @returns {string}
 */
export function formata(valor, opcoes) {
  let formatado = "";
  if (typeof opcoes == "string") opcoes = [opcoes];
  opcoes.forEach((opcao) => {
    switch (opcao) {
      /**
       * Moeda BRL: R$ 1.234,56
       * formata(1234.56, 'BRL');
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
       * formata(1.23, 'numero');
       */
      case "numero":
        formatado = new Intl.NumberFormat("pt-BR", {
          style: "decimal",
        }).format(valor);
        break;

      /**
       * Porcentagem: 0,50%
       * formata(0.5, 'porcentagem');
       */
      case "porcentagem":
        formatado = new Intl.NumberFormat("pt-BR", {
          style: "percent",
          minimumFractionDigits: 2,
        }).format(valor / 100);
        break;

      /**
       * Positivo: texto em verde
       * formata(0.5, 'positivo');
       * formata(-0.5, ['positivo', 'negativo']);
       */
      case "positivo":
        if (valor >= 0)
          formatado = `<span class="text-success">${formatado}</span>`;
        break;

      /**
       * Negativo: texto em vermelho
       * formata(-0.5, 'negativo');
       * formata(0.5, ['positivo', 'negativo']);
       */
      case "negativo":
        if (valor < 0)
          formatado = `<span class="text-danger">${formatado}</span>`;
        break;

      /**
       * Seta: ícone de subida ou descida, se o valor é positivo ou negativo
       * formata(0.5, 'seta');
       */
      case "seta":
        formatado =
          valor < 0
            ? `<i class="bi bi-arrow-down text-danger"></i> ${formatado}`
            : `<i class="bi bi-arrow-up text-success"></i> ${formatado}`;
        break;

      /**
       * setaPositiva: adiciona o ícone de subida
       * formata(100, 'setaPositiva')
       * formata(100, ['BRL', a > b ? 'setaPositiva' : 'setaNegativa'])
       */
      case "setaPositiva":
        formatado = `<i class="bi bi-arrow-up text-success"></i> ${formatado}`;
        break;

      /**
       * setaNegativa: adiciona o ícone de descida
       * formata(100, 'setaNegativa')
       * formata(100, ['BRL', a > b ? 'setaPositiva' : 'setaNegativa'])
       */
      case "setaNegativa":
        formatado = `<i class="bi bi-arrow-down text-danger"></i> ${formatado}`;
        break;
    }
  });
  return formatado;
}
