import config from "/config.js";
import { App } from "./app.js";
import { calculaAcumulado, preparaData } from "./compartilhado.js";

let CACHE;

// Carrega os dados no cache
// Dados são mensais

export async function loadIPCA() {
  let url = encodeURIComponent(
    "https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json"
  );
  return fetch(`${config.proxy}?name=ipca&url=${url}`)
    .then((response) => response.json())
    .then((response) => {
      let json = response.map((item) => {
        item.data = item.data.split("/").reverse().join("-");
        item.data = luxon.DateTime.fromISO(item.data).toMillis();
        item.valor = parseFloat(item.valor);
        return item;
      });
      json.sort((a, b) => a.data - b.data); // Ordem crescente
      CACHE = json;
    });
}

App.addLoad(loadIPCA);

/**
 * Retorna os dados brutos, clonados para evitar alterações por referência
 * @returns {array}
 */
export function ipcaDadosMensais() {
  return [...CACHE.map((item) => ({ ...item }))]; // Clonagem rápida
}

/**
 * Retorna o valor do mês
 * @param {number} month - Mês
 * @param {number} year  - Ano
 * @returns {number}
 */
export function ipcaMes(month, year) {
  let data = luxon.DateTime.fromObject({ month, year })
    .startOf("month")
    .toMillis();
  let dados = ipcaDadosMensais().find((item) => item.data == data);
  return dados ? dados.valor : null;
}

/**
 * Retorna os dados mensais de um período
 * ipcaMensal(de, ate, true).map((item) => [item.data, item.valor]) - Mapeia para uma série do gráfico
 * ipcaMensal(de, ate).map((item) => item.valor) - Separa apenas os valores
 * ipcaMensal(de, ate, true).at(-1).valor - Pega o valor final acumulado do período
 * @param {timestamp|ISO|DateTime} de - Data de início
 * @param {timestamp|ISO|DateTime} ate - Date final
 * @param {boolean} acumulado - Realiza o acumulado dos dados
 * @returns {array}
 */
export function ipcaMensal(de = null, ate = null, acumulado = false) {
  de = preparaData(de ? de : "2000-01-01")
    .startOf("month")
    .toMillis();
  ate = preparaData(ate ? ate : luxon.DateTime.now())
    .startOf("month")
    .toMillis();
  let dados = ipcaDadosMensais().filter((item) => {
    return item.data >= de && item.data <= ate;
  });
  return acumulado ? calculaAcumulado(dados, "valor") : dados;
}

/**
 * Retorna os dados dos últimos 12 meses
 * @param {boolean} acumulado - Realiza o acumulado dos dados
 * @returns {array}
 */
export function ipca12meses(acumulado = false) {
  let dados = ipcaDadosMensais().slice(-12);
  return acumulado ? calculaAcumulado(dados, "valor") : dados;
}

/**
 * Retorna a média mensal dos últimos 12 meses
 * @returns {number}
 */
export function ipcaMediaAno() {
  return ipca12meses().reduce((soma, item) => (soma += item.valor), 0) / 12;
}

/**
 * Retorna o acumulado dos últimos 12 meses
 * @returns {number}
 */
export function ipcaAcumuladoAno() {
  return ipca12meses(true).at(-1).valor;
}
