import { App } from "./app.js";

let CSV = [];

const COLUMNS = [
  // Extrato
  "tipo",
  "data",
  "movimentacao",
  "produto",
  "instituicao",
  "quantidade",
  "preco",
  "valor",
  // Adicionados
  "codigo",
];

// Retorna uma consulta ao extrato.
// Informações detalhadas na classe __EXTRATO logo abaixo.

export function extrato() {
  return new __EXTRATO(CSV);
}

// Carrega o arquivo de extrato da B3
// Permite carregar elementos de teste passando o conteúdo igual ao CSV

export async function loadExtrato(teste = null) {
  if (teste) return parseCSV(teste);
  const nocache = new Date().valueOf();
  return fetch(`/database/extrato.csv?v=${nocache}`)
    .then((response) => response.text())
    .then((response) => parseCSV(response));
}

App.addLoad(loadExtrato, 1);

// Parse CSV

function parseCSV(response) {
  Papa.parse(response, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header, index) => COLUMNS[index],
    transform: (value, header) => formatValue(value, header),
    complete: function (results) {
      CSV = results.data;
      CSV.sort((a, b) => a.data - b.data); // Ordem crescente
      buildCodigos();
    },
  });
}

// Cria uma coluna com o código do ativo

function buildCodigos() {
  const exp = /^([A-Z]{4}[0-9]{1,2}[A-Z]?)/g;

  CSV.forEach((item) => {
    const codigo = item.produto.match(exp);
    item.codigo = codigo ? codigo[0].toUpperCase() : "";
  });

  // Atualiza o código quando necessário

  CSV.filter((item) => item.movimentacao == "ATUALIZAÇÃO").forEach((item) => {
    let codigo = item.produto.match(exp);
    if (codigo) {
      codigo = codigo[0].toUpperCase();
      const produto = item.produto.split(" ").slice(1, -1).join(" ");
      CSV.forEach((row) => {
        if (row.produto.indexOf(produto) > 0) row.codigo = codigo;
      });
    }
  });
}

// Formata os valores das colunas

function formatValue(value, column) {
  switch (column) {
    case "tipo":
      return value.toUpperCase();
    case "data":
      value = value.split("/").reverse().join("-");
      return luxon.DateTime.fromISO(value).toMillis();
    case "movimentacao":
      return value.toUpperCase();
    case "produto":
      return value.trim();
    case "instituicao":
      return value.trim();
    case "quantidade":
      value = parseFloat(value.replace(",", "."));
      return typeof value == "number" && !isNaN(value) ? value : 0;
    case "preco":
      value = parseFloat(value.replace(/[^\d,]/g, "").replace(",", "."));
      return typeof value == "number" && !isNaN(value) ? value : 0;
    case "valor":
      value = parseFloat(value.replace(/[^\d,]/g, "").replace(",", "."));
      return typeof value == "number" && !isNaN(value) ? value : 0;
  }
  return value;
}

/*
Classe destinada a percorrer os dados no Extrato da B3.

O método de uso é filtrando dados do extrato até alcançar o que se deseja
e no final utilizar uma dos getters para retornar uma informação, exemplos:

extrato().codigo('ATIVO').proventos().valor - Retorna o valor total de proventos do ativo
extrato().mes(5, 2024).proventos().valor - Retorna o total pago de proventos no mês
extrato().ano(2024).dados - Retorna os dados existentes do ano
extrato().codigo('ATIVO').ate('2024-03-01').investido - Retorna o valor investido até esta data

O objeto é propagado com novas instâncias, é possível armazenar uma delas e prosseguir deste ponto.

const ativo = extrato().codigo('ATIVO'); - Instância armazenada com apenas este ativo
ativo.proventos().valor; - Filtra proventos e obtém seu valor
ativo.impostos().valor; - Filtra impostos e obtém seu valor, sem sofrer interferência pelo filtro anterior proventos()
*/

class __EXTRATO {
  constructor(dados = []) {
    this.json = dados;
    // this.json = [...dados.map((item) => ({ ...item }))]; // Clonagem rápida
  }

  // Busca genérica a partir de uma coluna do extrato
  // .busca('produto', 'Tesouro'); - Por correpondência exata
  // .busca('produto', /(LCI |LCA )/); - Por expressão regular
  // .busca('movimentacao', ['IR', 'COBRANÇA DE TAXA SEMESTRAL']); - Múltiplas consultas

  busca(coluna, consulta) {
    if (!Array.isArray(consulta)) consulta = [consulta];
    let dados = this.json.filter((item) => {
      let resultados = consulta.map((teste) => {
        if (typeof teste == "object") return teste.test(item[coluna]);
        else return item[coluna] == teste;
      });
      return resultados.includes(true);
    });
    return new __EXTRATO(dados);
  }

  /**
   * Filtros para percorrer os dados do extrato
   */

  // Filtra pelo nome do prduto
  // .produto('Tesouro'); - Por correpondência exata
  // .produto(/(LCI |LCA )/); - Por expressão regular
  // .produto(['ABC','XYZ']); - Array de consultas

  produto(nome) {
    return this.busca("produto", nome);
  }

  // Filtra pelo código de negociação
  // .codigo('ATIVO');
  // .codigo(['ABC11', 'XYZ11']);

  codigo(codigo) {
    return this.busca("codigo", codigo);
  }

  // Filtra a partir de uma data (Milisegundos, ISO ou DateTime)

  de(data) {
    if (typeof data == "string") data = luxon.DateTime.fromISO(data);
    if (data instanceof luxon.DateTime) data = data.toMillis();
    return new __EXTRATO(this.json.filter((item) => item.data >= data));
  }

  // Filtra até uma data (Milisegundos, ISO ou DateTime)

  ate(data) {
    if (typeof data == "string") data = luxon.DateTime.fromISO(data);
    if (data instanceof luxon.DateTime) data = data.toMillis();
    return new __EXTRATO(this.json.filter((item) => item.data <= data));
  }

  // Filtra o conteúdo do mês
  // .codigo('ATIVO').mes(5, 2024).proventos();

  mes(month, year) {
    const data = luxon.DateTime.fromObject({ month, year });
    return this.de(data.startOf("month")).ate(data.endOf("month"));
  }

  // Filtra o conteúdo do ano
  // .codigo('ATIVO').ano(2024).taxas();

  ano(year) {
    const data = luxon.DateTime.fromObject({ year });
    return this.de(data.startOf("year")).ate(data.endOf("year"));
  }

  // Filtra todos os recebidos
  // .codigo('ATIVO').proventos();

  proventos() {
    return this.busca("movimentacao", [
      "RENDIMENTO",
      "DIVIDENDO",
      "JUROS SOBRE CAPITAL PRÓPRIO",
      "JUROS",
    ]);
  }

  // Filtra por Rendimentos

  rendimentos() {
    return this.busca("movimentacao", "RENDIMENTO");
  }

  // Filtra por Dividendos

  dividendos() {
    return this.busca("movimentacao", "DIVIDENDO");
  }

  // Filtra por Juros Sobre Capital Próprio

  jcp() {
    return this.busca("movimentacao", "JUROS SOBRE CAPITAL PRÓPRIO");
  }

  // Filtra por cupom de juros

  juros() {
    return this.busca("movimentacao", "JUROS");
  }

  // Filtra por impostos

  impostos() {
    return this.busca("movimentacao", "IR");
  }

  // Filtra por taxas

  taxas() {
    return this.busca("movimentacao", ["TAXAS", "COBRANÇA DE TAXA SEMESTRAL"]);
  }

  // Filtra as negociações de compra
  // .codigo('ATIVO').compras().dados[0]; - Obtém a primeira compra do ativo

  compras() {
    return this.busca("movimentacao", [
      "TRANSFERÊNCIA - LIQUIDAÇÃO",
      "COMPRA / VENDA",
      "COMPRA",
    ]).busca("tipo", "CREDITO");
  }

  // Filtra as negociações de venda
  // .produto('Tesouro').vendas().dados.at(-1) - Obtém a liquidação final;

  vendas() {
    return this.busca("movimentacao", [
      "TRANSFERÊNCIA - LIQUIDAÇÃO",
      "COMPRA / VENDA",
      "VENCIMENTO", // TODO faz sentido entrar aqui? .produto('Tesouro').resgatado
      "VENDA",
    ]).busca("tipo", "DEBITO");
  }

  // Retorna uma lista de produtos
  // .produtos() - Retorna a lista completa
  // .produtos('fiis') - Retorna apenas os código de Fundos Imobiliários

  produtos(tipo = null) {
    let produtos = [];
    let codigos = [];
    this.json.forEach((item) => {
      if (!produtos.includes(item.produto)) produtos.push(item.produto);
      if (item.codigo != "" && !codigos.includes(item.codigo))
        codigos.push(item.codigo);
    });
    switch (tipo) {
      case "ativos":
        return codigos.filter((codigo) => /3|4|5|6|7|8|11$/g.test(codigo));
      case "acoes":
        return codigos.filter((codigo) => /3|4|5|6|7|8$/g.test(codigo));
      case "fiis":
        return codigos.filter((codigo) => /11$/g.test(codigo));
      case "rendafixa":
        return produtos.filter((produto) => /^CDB |LCI |LCA /g.test(produto));
      case "tesouro":
        return produtos.filter((produto) => /^Tesouro/g.test(produto));
    }
    return produtos;
  }

  /**
   * Funções para cálculo ou retorno de dados
   */

  // Retorna os dados existentes
  // Dados são clonados para evitar manipulação por referência.
  // .codigo('ATIVO').dados;

  get dados() {
    return [...this.json.map((item) => ({ ...item }))]; // Clonagem rápida
  }

  // Retorna a quantidade de cotas
  // .codigo('ATIVO').quantidade;
  // .produto('Tesouro').quantidade;

  get quantidade() {
    const movimentacoes = [
      "TRANSFERÊNCIA - LIQUIDAÇÃO",
      "COMPRA / VENDA",
      "VENCIMENTO",
      "COMPRA",
      "VENDA",
      "BONIFICAÇÃO EM ATIVOS",
      "FRAÇÃO EM ATIVOS",
      "LEILÃO DE FRAÇÃO",
      "INCORPORAÇÃO",
    ];
    return this.json.reduce((sum, item) => {
      if (item.movimentacao == "ATUALIZACAO") return item.quantidade;
      if (movimentacoes.includes(item.movimentacao)) {
        if (item.tipo == "CREDITO") sum += item.quantidade;
        if (item.tipo == "DEBITO") sum -= item.quantidade;
      }
      return sum;
    }, 0);
  }

  // Retorna o valor do preço médio de um investimento
  // .codigo('ATIVO').precoMedio;
  // .produto('Tesouro').precoMedio;

  get precoMedio() {
    const movimentacoes = [
      "TRANSFERÊNCIA - LIQUIDAÇÃO",
      "COMPRA / VENDA",
      "COMPRA",
    ];
    let valores = this.json.reduce((sum, item) => {
      if (movimentacoes.includes(item.movimentacao))
        if (item.tipo == "CREDITO") sum.push(item.preco);
      return sum;
    }, []);
    if (valores.length == 0) return 0;
    return valores.reduce((sum, item) => (sum += item), 0) / valores.length;
  }

  // Retorna a soma de todos os valores filtrados
  // .rendimentos().valor;
  // .proventos().valorMinimmo;
  // .proventos().valorMedio;
  // .proventos().valorMaximo;

  get valor() {
    return this.json.reduce((sum, item) => {
      if (item.tipo == "CREDITO") sum += item.valor;
      if (item.tipo == "DEBITO") sum -= item.valor;
      return sum;
    }, 0);
  }

  get valorMinimo() {
    return Math.min(...this.json.map((item) => item.valor));
  }

  get valorMedio() {
    return this.json.length ? this.valor / this.json.length : 0;
  }

  get valorMaximo() {
    return Math.max(...this.json.map((item) => item.valor));
  }

  // Retorna o total do investimento realizado
  // .codigo('ATIVO').investimento
  // .produto('Tesouro').investimento
  // TODO incorreto porque acumula compras sem as vendas ao longo do período
  // funciona somente para títulos sem movimentações

  get investimento() {
    return this.compras().valor;
  }

  // Retorna o valor atualmente investido
  // Acompanha a quantidade de cotas para definir se ainda existe investimento ou encerrou com prejuízo
  // .codigo('ATIVO').investido
  // .codigo('ATIVO').ate(timestamp).investido - Precisa calcular desde o início

  get investido() {
    return this.quantidade > 0 ? this.compras().valor + this.vendas().valor : 0;
  }

  // Retorna o valor do resgate realizado
  // .produto('Tesouro').resgatado
  // .codigo('ATIVO').mes(1, 2024).resgatado

  get resgatado() {
    return Math.abs(this.vendas().valor);
  }
}

/*
Tesouro
let tesouro = extrato().produto('Tesouro');
let investido = tesouro.busca('movimentacao', 'compra').valor;
let resgatado = tesouro.busca('movimentacao', 'vencimento').valor;
*/
