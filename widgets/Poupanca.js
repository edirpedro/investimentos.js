import {
  extrato,
  bolsaHoje,
  formata,
  poupancaCorrigida,
  calcRentabilidade,
} from "/functions/index.js";

const template = `
<div class="card mb-4 shadow-lg">
  <div class="card-body">
    <h5 class="card-title text-uppercase">Poupança</h5>
    <p class="card-text small">Se estivesse largado na poupança?</p>
    <div class="chart-poupanca">
      <div class="text-bg-info" style="flex:<%= rentPoupanca %>"><%- formata(rentPoupanca, 'porcentagem') %></div>
      <div class="text-bg-warning" style="flex:<%= rentPosicao %>"><%- formata(rentPosicao, 'porcentagem') %></div>
    </div>
  </div>
</div>
<style>
.chart-poupanca { display: flex; overflow: hidden; border-radius: var(--bs-border-radius-pill); }
.chart-poupanca > div { display: flex; align-items: center; padding: 2px 10px; font-size: 0.75em; font-weight: 700; }
</style>
`;

/**
 * Widget que mostra o que teria ocorrido se o investimento fosse no sossego da Poupança
 * Não mostra valores porque não tem como acompanhar as movimentações,
 * acompanhar o valor incial já é suficiente para entender se esta performando bem.
 */
export default function WidgetPoupanca(element) {
  let ativos = element.getAttribute("data-ativos");
  ativos = ativos.split(",");

  const inicio = extrato().codigo(ativos).dados.at(0).data;
  const hoje = luxon.DateTime.now().toMillis();

  let investido = extrato().codigo(ativos).investido;
  let posicao = 0;

  ativos.forEach((codigo) => {
    const ativo = extrato().codigo(codigo).ate(hoje);
    let cotacao = bolsaHoje(codigo);
    let quantidade = ativo.quantidade;
    let proventos = ativo.proventos().valor;
    posicao += cotacao * quantidade + proventos;
  });

  let calculo = poupancaCorrigida(investido, inicio, hoje);
  let rentPoupanca = calcRentabilidade(calculo, investido);
  let rentPosicao = calcRentabilidade(posicao, investido);

  let html = ejs.render(template, { rentPoupanca, rentPosicao, formata });
  element.innerHTML = html;
}
