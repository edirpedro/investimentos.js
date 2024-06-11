import config from "/config.js";
import { App } from "./app.js";
import { calculaAcumulado, preparaData } from "./compartilhado.js";

let CACHE;

// Carrega os dados no cache
// Dados são diários

export async function loadCDI() {
  let url = encodeURIComponent(
    "https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados?formato=json"
  );
  return fetch(`${config.proxy}?name=cdi&url=${url}`)
    .then((response) => response.json())
    .then((response) => {
      let json = response.map((item) => {
        // Auxilia na separação de dados mensais
        let data = item.data.split("/");
        item.dia = parseInt(data[0]);
        item.mes = parseInt(data[1]);
        item.ano = parseInt(data[2]);
        item.data = data.reverse().join("-");
        item.data = luxon.DateTime.fromISO(item.data).toMillis();
        item.valor = parseFloat(item.valor);
        return item;
      });
      json.sort((a, b) => a.data - b.data); // Ordem crescente
      CACHE = json;
    });
}

App.addLoad(loadCDI);

/**
 * Retorna os dados brutos, clonados para evitar alterações por referência
 * @returns {array}
 */
export function cdiDadosDiarios() {
  return [...CACHE.map((item) => ({ ...item }))]; // Clonagem rápida
}

/**
 * Retorna os dados brutos, acumulado mensalmente
 * @returns {array}
 */
export function cdiDadosMensais() {
  let mes = 0;
  let calculo = 1;
  let resultado = cdiDadosDiarios().reduce((resultado, item) => {
    if (item.mes != mes) {
      calculo = 1;
      resultado.push({ mes: item.mes, ano: item.ano, valor: 0 });
    }
    calculo *= 1 + item.valor / 100;
    resultado.at(-1).valor = (calculo - 1) * 100;
    mes = item.mes;
    return resultado;
  }, []);
  return resultado.map((item) => {
    return {
      data: luxon.DateTime.fromObject({
        year: item.ano,
        month: item.mes,
        day: 1,
      }).toMillis(),
      valor: item.valor,
      dia: 1,
      mes: item.mes,
      ano: item.ano,
    };
  });
}

/**
 * Retorna o valor do mês
 * @param {number} month - Mês
 * @param {number} year  - Ano
 * @returns {number}
 */
export function cdiMes(month, year) {
  let data = luxon.DateTime.fromObject({ month, year })
    .startOf("month")
    .toMillis();
  let dados = cdiDadosMensais().find((item) => item.data == data);
  return dados ? dados.valor : null;
}

/**
 * Retorna os dados mensais de um período
 * cdiDiario(de, ate, true).map((item) => [item.data, item.valor]) - Mapeia para uma série do gráfico
 * cdiDiario(de, ate).map((item) => item.valor) - Separa apenas os valores
 * cdiDiario(de, ate, true).at(-1).valor - Pega o valor final acumulado do período
 * @param {timestamp|ISO|DateTime} de - Data de início
 * @param {timestamp|ISO|DateTime} ate - Date final
 * @param {boolean} acumulado - Realiza o acumulado dos dados
 * @returns {array}
 */
export function cdiDiario(de = null, ate = null, acumulado = false) {
  de = preparaData(de ? de : "2000-01-01").toMillis();
  ate = preparaData(ate ? ate : luxon.DateTime.now()).toMillis();
  let dados = cdiDadosDiarios().filter((item) => {
    return item.data >= de && item.data <= ate;
  });
  return acumulado ? calculaAcumulado(dados, "valor") : dados;
}

/**
 * Retorna os dados mensais de um período
 * cdiMensal(de, ate, true).map((item) => [item.data, item.valor]) - Mapeia para uma série do gráfico
 * cdiMensal(de, ate).map((item) => item.valor) - Separa apenas os valores
 * cdiMensal(de, ate, true).at(-1).valor - Pega o valor final acumulado do período
 * @param {timestamp|ISO|DateTime} de - Data de início
 * @param {timestamp|ISO|DateTime} ate - Date final
 * @param {boolean} acumulado - Realiza o acumulado dos dados
 * @returns {array}
 */
export function cdiMensal(de = null, ate = null, acumulado = false) {
  de = preparaData(de ? de : "2000-01-01")
    .startOf("month")
    .toMillis();
  ate = preparaData(ate ? ate : luxon.DateTime.now())
    .startOf("month")
    .toMillis();
  let dados = cdiDadosMensais().filter((item) => {
    return item.data >= de && item.data <= ate;
  });
  return acumulado ? calculaAcumulado(dados, "valor") : dados;
}

/**
 * Retorna os dados dos últimos 12 meses
 * @param {boolean} acumulado - Realiza o acumulado dos dados
 * @returns {array}
 */
export function cdi12meses(acumulado = false) {
  let dados = cdiDadosMensais().slice(-12);
  return acumulado ? calculaAcumulado(dados, "valor") : dados;
}

/**
 * Retorna a média mensal dos últimos 12 meses
 * @returns {number}
 */
export function cdiMediaAno() {
  return cdi12meses().reduce((soma, item) => (soma += item.valor), 0) / 12;
}

/**
 * Retorna o acumulado dos últimos 12 meses
 * @returns {number}
 */
export function cdiAcumuladoAno() {
  return cdi12meses(true).at(-1).valor;
}
