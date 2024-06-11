import { bolsaCotacoes } from "./bolsa.js";

/**
 * Retorna um array de dias úteis pegando carona nos dias de mercado aberto
 * @param {timestamp} de - Data inicial em milisegundos
 * @param {timestamp} ate - Data final em milisegundos
 * @returns {array}
 */
export function diasUteis(de, ate) {
  return bolsaCotacoes("^BVSP")
    .filter((item) => item.data >= de && item.data <= ate)
    .map((item) => item.data);
}
