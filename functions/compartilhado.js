/**
 * Realiza o acumulado dos dados
 * ((1 + valor / 100) * ... - 1) * 100
 * @param {array} dados - Array com dados
 * @param {string} key - Chave para localizar os valores no array
 * @returns {array}
 */
export function calculaAcumulado(dados, key) {
  let calculo = 1;
  dados.forEach((item) => {
    calculo *= 1 + item[key] / 100;
    item[key] = (calculo - 1) * 100;
  });
  return dados;
}

/**
 * Permite passar dados em formato Timestamp, ISO ou DateTime
 * @param {timestamp|ISO|DateTime} data - Data
 * @returns {DateTime}
 */
export function preparaData(data) {
  if (typeof data == "number") data = luxon.DateTime.fromMillis(data);
  if (typeof data == "string") data = luxon.DateTime.fromISO(data);
  return data;
}
