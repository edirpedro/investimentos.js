import { App } from "./app.js";
import { extrato } from "./extrato.js";
import config from "/config.js";

let CACHE = [];
let ADICIONAIS = ["^BVSP"];

// Carrega os dados no cache

export async function loadBolsa() {
  let simbolos = extrato()
    .produtos("ativos")
    .map((codigo) => codigo + ".SA");
  simbolos = [...simbolos, ...ADICIONAIS];

  let requests = simbolos.map((simbolo) => {
    let codigo = simbolo.replace(".SA", "");
    let hoje = luxon.DateTime.now();
    let url = `https://query1.finance.yahoo.com/v8/finance/chart/${simbolo}`;
    let params = new URLSearchParams({
      region: "BR",
      lang: "pt-BR",
      includePrePost: "false",
      interval: "1d",
      period1: parseInt(hoje.minus({ years: 20 }).toSeconds()),
      period2: parseInt(hoje.toSeconds()),
    });
    url = encodeURIComponent(`${url}?${params}`);
    return fetch(`${config.proxy}?name=${codigo}&url=${url}`)
      .then((response) => response.json())
      .then((response) => {
        if (response?.chart?.error == null) {
          const result = response.chart.result[0];
          let cotacoes = [];
          let anterior = 0;
          result.timestamp.forEach((timestamp, index) => {
            // Corrigindo fuso horário no timestamp
            let data = luxon.DateTime.fromSeconds(timestamp)
              .startOf("day")
              .toMillis();
            let valor = result.indicators.quote[0].close[index];
            // TODO As vezes retorna ontem como null, não descobri o motivo!
            // Se ocorrer, utiliza a última cotação válida como auxiliar
            if (valor === null) valor = anterior;
            else anterior = valor;
            cotacoes.push({ data, valor });
          });
          CACHE[codigo] = { dados: result.meta, cotacoes };
        }
      });
  });

  return await Promise.all(requests);
}

App.addLoad(loadBolsa);

/**
 * Retorna os dados brutos
 * @param {string} codigo - Código de negociação
 * @returns {array}
 */
export function bolsaDados(codigo) {
  return codigo in CACHE ? CACHE[codigo] : [];
}

/**
 * Retorna dados sobre o símbolo
 * @param {string} codigo - Código de negociação
 * @returns {object}
 */
export function bolsaSimbolo(codigo) {
  return bolsaDados(codigo).dados;
}

/**
 * Retorna todas as cotações
 * @param {string} codigo - Código de negociação
 * @returns {array}
 */
export function bolsaCotacoes(codigo) {
  return bolsaDados(codigo).cotacoes;
}

/**
 * Retorna a cotação do mês
 * @param {string} codigo - Código de negociação
 * @param {number|timestamp|DateTime} month - Mês, Timestamp ou DateTime
 * @param {number} year - Ano
 * @returns {number}
 */
export function bolsaMes(codigo, month, year = null) {
  if (typeof month == "number" && month > 1000)
    month = luxon.DateTime.fromMillis(month);
  if (month && year) month = luxon.DateTime.fromObject({ year, month });
  if (month instanceof luxon.DateTime) month = month.endOf("month");
  return bolsaDia(codigo, month);
}

/**
 * Retorna a cotação válida para o dia
 * @param {string} codigo - Código de negociação
 * @param {number|timestamp|DateTime} day - Dia, Timestamp ou DateTime
 * @param {number} month - Mês
 * @param {number} year - Ano
 * @returns {number}
 */
export function bolsaDia(codigo, day, month = null, year = null) {
  if (day && month && year)
    day = luxon.DateTime.fromObject({ year, month, day });
  if (day instanceof luxon.DateTime) day = day.toMillis();
  let cotacao = bolsaCotacoes(codigo).findLast((item) => item.data <= day); // Último dia útil disponível
  return cotacao ? cotacao.valor : null;
}

/**
 * Retorna a cotação de hoje
 * @param {string} codigo - Código de negociação
 * @returns {number}
 */
export function bolsaHoje(codigo) {
  return bolsaDados(codigo).cotacoes.at(-1).valor;
}
