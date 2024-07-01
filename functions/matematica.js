/**
 * Matemática Financeira
 */

// R = T / 100
export function calcPorcentagem(taxa) {
  return taxa / 100;
}

// R = V . T . P
export function calcJurosSimples(valor, taxa, periodo) {
  return valor * (taxa / 100) * periodo;
}

export function calcJurosCompostos(valor, taxa, periodo) {
  return calcValorFuturo(valor, taxa, periodo);
}

// BCB calculadora do cidadão (Valor Futuro)
// R = (1 + T) ^ P . V
export function calcValorFuturo(valor, taxa, periodo) {
  return Math.pow(1 + taxa / 100, periodo) * valor;
}

// BCB calculadora do cidadão (Depósitos Regulares)
// R = (1 + T) . [((1 + T) ^ P) - 1 / T] . V
export function calcDepositosRegulares(valor, taxa, periodo) {
  taxa /= 100;
  return (1 + taxa) * ((Math.pow(1 + taxa, periodo) - 1) / taxa) * valor;
}

// R = R / I . 100
export function calcRentabilidade(resgatado, investido) {
  return (resgatado / investido) * 100 - 100;
}

// R = (1 + T) ^ P
export function calcTaxaDeJuros(taxa, periodo) {
  return Math.pow(1 + taxa / 100, periodo) - 1;
}
