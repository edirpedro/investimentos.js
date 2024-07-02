import config from "/config.js";
import { App } from "./app.js";
import { calculaAcumulado, preparaData } from "./compartilhado.js";

let CACHE;

// Carrega os dados no cache
// Dados são diários mas contém o acumulado do aniversário, são mensais a cada dia
// 1º dia do mês representa o valor mensal divulgado
// A leitura fica sendo mensal, igual IPCA

export async function loadPoupanca() {
  let url = encodeURIComponent(
    "https://api.bcb.gov.br/dados/serie/bcdata.sgs.195/dados?formato=json"
  );
  return fetch(`${config.proxy}?name=poupanca&url=${url}`)
    .then((response) => response.json())
    .then((response) => {
      let json = response.map((item) => {
        let data = item.data.split("/");
        item.dia = parseInt(data[0]); // Auxilia na separação de dados mensais
        item.data = data.reverse().join("-");
        item.data = luxon.DateTime.fromISO(item.data).toMillis();

        let dataFim = item.dataFim.split("/");
        item.diaFim = parseInt(dataFim[0]); // Auxilia na separação de aniversários
        item.dataFim = dataFim.reverse().join("-");
        item.dataFim = luxon.DateTime.fromISO(item.dataFim).toMillis();

        item.valor = parseFloat(item.valor);
        return item;
      });
      json.sort((a, b) => a.data - b.data); // Ordem crescente
      CACHE = json;
    });
}

App.addLoad(loadPoupanca);

/**
 * Retorna os dados brutos, clonados para evitar alterações por referência
 * @returns {array}
 */
export function poupancaDados() {
  return [...CACHE.map((item) => ({ ...item }))]; // Clonagem rápida
}

/**
 * Retorna os dados mensais do dia 1º de cada mês, aqueles divulgados na internet
 * @returns {array}
 */
export function poupancaDadosMensais() {
  return poupancaDados().filter((item) => item.dia === 1);
}

/**
 * Retorna os dados mensais de cada aniversário
 * @param {number} dia - Dia do aniversário
 * @returns {array}
 */
export function poupancaDadosAniversarios(dia) {
  if (dia > 28) dia = 1; // Regra do Banco Central
  return poupancaDados().filter((item) => item.diaFim == dia);
}

/**
 * Retorna o valor do mês
 * @param {number} month - Mês
 * @param {number} year  - Ano
 * @returns {number}
 */
export function poupancaMes(month, year) {
  let data = luxon.DateTime.fromObject({ month, year })
    .startOf("month")
    .toMillis();
  let dados = poupancaDadosMensais().find((item) => item.data == data);
  return dados ? dados.valor : null;
}

/**
 * Retorna os dados mensais de um período
 * poupancaMensal(de, ate, true).map((item) => [item.data, item.valor]) - Mapeia para uma série do gráfico
 * poupancaMensal(de, ate).map((item) => item.valor) - Separa apenas os valores
 * poupancaMensal(de, ate, true).at(-1).valor - Pega o valor final acumulado do período
 * @param {timestamp|ISO|DateTime} de - Data de início
 * @param {timestamp|ISO|DateTime} ate - Date final
 * @param {boolean} acumulado - Realiza o acumulado dos dados
 * @returns {array}
 */
export function poupancaMensal(de = null, ate = null, acumulado = false) {
  de = preparaData(de ? de : "2000-01-01")
    .startOf("month")
    .toMillis();
  ate = preparaData(ate ? ate : luxon.DateTime.now())
    .startOf("month")
    .toMillis();
  let dados = poupancaDadosMensais().filter(
    (item) => item.data >= de && item.data <= ate
  );
  return acumulado ? calculaAcumulado(dados, "valor") : dados;
}

/**
 * Retorna os dados dos aniversários dentro do período
 * Segue a metodologia explicada na calculadora do cidadão.
 * https://www3.bcb.gov.br/CALCIDADAO/publico/corrigirPelaPoupanca.do?method=corrigirPelaPoupanca
 * @param {timestamp|ISO|DateTime} de - Data inicial
 * @param {timestamp|ISO|DateTime|null} ate - Data final ou será usada a data atual
 * @param {boolean} acumulado - Se o valor deve ser acumulado
 * @returns {array}
 */
export function poupancaAniversarios(de, ate = null, acumulado = false) {
  de = preparaData(de ? de : "2012-06-05").startOf("day");
  ate = preparaData(ate ? ate : luxon.DateTime.now()).startOf("day");

  // Dias 29, 30 e 31 avançam para o dia 1.
  if (de.day > 28) de = de.endOf("month").plus({ days: 1 }).startOf("day");

  // Contagem de aniversários
  let nivers = luxon.Interval.fromDateTimes(de, ate)
    .splitBy({ months: 1 })
    .map((item) => item.end) // pega os intervalos finais
    .filter((item) => item.day == de.day) // apenas as datas com dia do aniversário
    .map((item) => item.toMillis()); // converte para buscar nos dados

  // Ainda não completou o primeiro aniversário
  if (nivers.length == 0) return [];

  // Coleta os dados dos efetivos aniversários
  let dados = poupancaDadosAniversarios(de.day).filter((item) => {
    return nivers.includes(item.dataFim);
  });

  return acumulado ? calculaAcumulado(dados, "valor") : dados;
}

/**
 * Retorna os dados dos últimos 12 meses
 * @param {boolean} acumulado - Realiza o acumulado dos dados
 * @returns {array}
 */
export function poupanca12meses(acumulado = false) {
  let dados = poupancaDadosMensais().slice(-12);
  return acumulado ? calculaAcumulado(dados, "valor") : dados;
}

/**
 * Retorna a média mensal dos últimos 12 meses
 * @returns {number}
 */
export function poupancaMediaAno() {
  return poupanca12meses().reduce((soma, item) => (soma += item.valor), 0) / 12;
}

/**
 * Retorna o acumulado dos últimos 12 meses
 * @returns {number}
 */
export function poupancaAcumuladoAno() {
  return poupanca12meses(true).at(-1).valor;
}

/**
 * Cálculo de correção da Poupança
 * Segue a metodologia explicada na calculadora do cidadão.
 * https://www3.bcb.gov.br/CALCIDADAO/publico/corrigirPelaPoupanca.do?method=corrigirPelaPoupanca
 * Método não acompanha aportes, entendo que é desnecessário,
 * serve para olhar para a rentabiliadde e não os rendimentos.
 * @param {number} investimento - Valor do investimento
 * @param {timestamp|ISO|DateTime} de - Data inicial do investimento
 * @param {timestamp|ISO|DateTime|null} ate - Data final do investimento ou será a data de hoje
 * @returns {number} - Valor do investimento corrigido
 */
export function poupancaCorrigida(investimento, de, ate = null) {
  let indice = 1;
  poupancaAniversarios(de, ate).forEach((item) => {
    indice *= 1 + item.valor / 100;
  });
  return (investimento *= indice);
  // return (investimento *= 1 + poupancaAniversarios(de, ate, true).at(-1).valor / 100);

  // TODO não vejo necessidade mas deixo aqui a ideia para acompanhar aportes e saques
  // Utilizar a entrada investimentos como array de aportes e saques [[data, 1000],[data, 100],[data, -50]]
  // Calcular como sendo multidata, cada aniversário nas entradas é separado agrupando aportes e saques
  // Saques entram no grupo do aniversário mais próximo a sua data
  // Cada aniversário é calculado individualmente e no final todos os valores são somados
}

/*
Outro formato de uso mas acho que agrupa demais as coisas e inutiliza o nome poupanca para variáveis.
Como funções ficou mais escalável e menos propenso a conflitos de uso como ocorre em extrato().valor.

poupanca().mediaAno; - como visto em extrato()
Poupanca.get12meses(); - como variável

class Poupanca {
  load() {}
  getDados() {}
  getDadosMensais(){}
  getDadosAniversarios(dia) {}
  mes(mes, ano) {}
  mensal(de, ate, acumulado) {}
  aniversarios(de, ate, acumulado) {}
  get12meses(acumulado) {}
  correcao(investimento, de, ate) {}
  get mediaAno() {}
  get acumuladoAno() {}
}
*/
