import config from "/config.js";
import { App } from "./app.js";

let CACHE;

// Carrega os dados no cache

export async function loadTesouro() {
  let url = encodeURIComponent(
    "https://www.tesourodireto.com.br/json/br/com/b3/tesourodireto/service/api/treasurybondsinfo.json"
  );
  return fetch(`${config.proxy}?name=tesouro&url=${url}`)
    .then((response) => response.json())
    .then((response) => {
      if (response.responseStatusText == "success")
        CACHE = JSON.stringify(response.response.TrsrBdTradgList);
    });
}

App.addLoad(loadTesouro);

/**
 * Retorna os dados brutos coletados
 * @returns {array}
 */
export function tesouroDados() {
  return JSON.parse(CACHE);
}

/**
 * Retorna os dados de um produto
 * @param {string} nome - Nome do produto
 * @returns {array}
 */
export function tesouroProduto(nome) {
  return tesouroDados().find((item) => item.TrsrBd.nm == nome);
}

/**
 * Retorna o valor unitário atual do produto
 * @param {string} nome - Nome do produto
 * @returns {number}
 */
export function tesouroValorUnitario(nome) {
  let produto = tesouroProduto(nome);
  return produto ? produto.TrsrBd.untrRedVal : 0;
}
