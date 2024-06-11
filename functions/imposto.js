/**
 * Cálculo do DARF, imposto a ser pago na venda de ações.
 * @param {number} compra - Valor de compra
 * @param {number} venda - Valor de venda
 * @returns {number} - Valor do imposto
 */
export function calculoDARF(compra = 0, venda = 0) {
  if (venda <= 20000) return 0; // Valores até 20k não pagam imposto
  if (venda < compra) return 0; // Não obteve lucro não paga imposto
  return ((venda - compra) * 15) / 100; // Alíquota de 15% sobre o lucro
}

export function calculoIR() {}
