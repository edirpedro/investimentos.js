import config from "/config.js";
import { App } from "./app.js";
import { calculaAcumulado, preparaData } from "./compartilhado.js";

let CACHE;

// Carrega os dados no cache
// Dados são diários

export async function loadSelic() {
  let url = encodeURIComponent(
    "https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados?formato=json"
  );
  return fetch(`${config.proxy}?name=selic&url=${url}`)
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

App.addLoad(loadSelic);

/**
 * Retorna os dados brutos, clonados para evitar alterações por referência
 * @returns {array}
 */
export function selicDadosDiarios() {
  return [...CACHE.map((item) => ({ ...item }))]; // Clonagem rápida
}

/**
 * Retorna os dados brutos, acumulado mensalmente
 * @returns {array}
 */
export function selicDadosMensais() {
  let mes = 0;
  let calculo = 1;
  let resultado = selicDadosDiarios().reduce((resultado, item) => {
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
export function selicMes(month, year) {
  let data = luxon.DateTime.fromObject({ month, year })
    .startOf("month")
    .toMillis();
  let dados = selicDadosMensais().find((item) => item.data == data);
  return dados ? dados.valor : null;
}

/**
 * Retorna os dados diários de um período
 * selicDiario(de, ate, true).map((item) => [item.data, item.valor]) - Mapeia para uma série do gráfico
 * selicDiario(de, ate).map((item) => item.valor) - Separa apenas os valores
 * selicDiario(de, ate, true).at(-1).valor - Pega o valor final acumulado do período
 * @param {timestamp|ISO|DateTime} de - Data de início
 * @param {timestamp|ISO|DateTime} ate - Date final
 * @param {boolean} acumulado - Realiza o acumulado dos dados
 * @returns {array}
 */
export function selicDiario(de = null, ate = null, acumulado = false) {
  de = preparaData(de ? de : "2000-01-01").toMillis();
  ate = preparaData(ate ? ate : luxon.DateTime.now()).toMillis();
  let dados = selicDadosDiarios().filter((item) => {
    return item.data >= de && item.data <= ate;
  });
  return acumulado ? calculaAcumulado(dados, "valor") : dados;
}

/**
 * Retorna os dados mensais de um período
 * selicMensal(de, ate, true).map((item) => [item.data, item.valor]) - Mapeia para uma série do gráfico
 * selicMensal(de, ate).map((item) => item.valor) - Separa apenas os valores
 * selicMensal(de, ate, true).at(-1).valor - Pega o valor final acumulado do período
 * @param {timestamp|ISO|DateTime} de - Data de início
 * @param {timestamp|ISO|DateTime} ate - Date final
 * @param {boolean} acumulado - Realiza o acumulado dos dados
 * @returns {array}
 */
export function selicMensal(de = null, ate = null, acumulado = false) {
  de = preparaData(de ? de : "2000-01-01")
    .startOf("month")
    .toMillis();
  ate = preparaData(ate ? ate : luxon.DateTime.now())
    .startOf("month")
    .toMillis();
  let dados = selicDadosMensais().filter((item) => {
    return item.data >= de && item.data <= ate;
  });
  return acumulado ? calculaAcumulado(dados, "valor") : dados;
}

/**
 * Retorna os dados dos últimos 12 meses
 * @param {boolean} acumulado - Realiza o acumulado dos dados
 * @returns {array}
 */
export function selic12meses(acumulado = false) {
  let dados = selicDadosMensais().slice(-12);
  return acumulado ? calculaAcumulado(dados, "valor") : dados;
}

/**
 * Retorna a média mensal dos últimos 12 meses
 * @returns {number}
 */
export function selicMediaAno() {
  return selic12meses().reduce((soma, item) => (soma += item.valor), 0) / 12;
}

/**
 * Retorna o acumulado dos últimos 12 meses
 * @returns {number}
 */
export function selicAcumuladoAno() {
  return selic12meses(true).at(-1).valor;
}
