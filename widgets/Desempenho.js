import {
  extrato,
  bolsaMes,
  formata,
  calcRentabilidade,
} from "/functions/index.js";

const template = `
<div class="card mb-4 shadow-lg">
  <div class="card-body">
    <h5 class="card-title text-uppercase">Desempenho</h5>
    <p class="card-text small">Como anda a valorização dos ativos e a distribuição entre meses fechados no positivo e negativo.</p>
    <ol class="list-group list-group-numbered list-group-flush">
      <% desempenho.forEach((item) => { %>
      <li class="list-group-item hstack gap-2">
        <a class="me-auto text-body" href="https://www.google.com/finance/quote/<%= item.codigo %>:BVMF" target="_blank">
          <strong><%= item.codigo %></strong>
        </a>
        <%- formata(item.valorizacao, ['porcentagem', 'negativo']) %>
        <div class="chart-desempenho">
          <div class="text-bg-info" style="flex:<%= item.positivos %>"></div>
          <div class="text-bg-warning" style="flex:<%= item.negativos %>"></div>
        </div>
      </li>
      <% }); %>
    </ol>
  </div>
</div>
<style>
.chart-desempenho { display: flex; width: 15%; overflow: hidden; border-radius: var(--bs-border-radius-pill); }
.chart-desempenho > div { height: 1rem; }
</style>
`;

/**
 *  Widget que mostra o desempenho dos ativos
 */
export default function WidgetDesempenho(element) {
  let ativos = element.getAttribute("data-ativos");
  ativos = ativos.split(",");

  let desempenho = [];

  ativos.forEach((codigo) => {
    let valorizacao = [];
    const ativo = extrato().codigo(codigo);
    const de = luxon.DateTime.fromMillis(ativo.dados.at(0).data);
    const ate = luxon.DateTime.now();
    let intervalo = luxon.Interval.fromDateTimes(de, ate)
      .splitBy({ months: 1 })
      .map((item) => item.start);
    if (intervalo.at(-1).month != ate.month) intervalo.push(ate);

    intervalo.forEach((data) => {
      const mes = ativo.ate(data.endOf("month"));
      let investido = mes.investido;
      let quantidade = mes.quantidade;
      let cotacao = bolsaMes(codigo, data);
      valorizacao.push(calcRentabilidade(cotacao * quantidade, investido));
    });

    desempenho.push({
      codigo,
      valorizacao: valorizacao.at(-1),
      positivos: valorizacao.reduce((sum, value) => {
        return (sum += value >= 0 ? 1 : 0);
      }, 0),
      negativos: valorizacao.reduce((sum, value) => {
        return (sum += value < 0 ? 1 : 0);
      }, 0),
    });
  });

  desempenho.sort((a, b) => b.valorizacao - a.valorizacao);

  let html = ejs.render(template, { desempenho, formata });
  element.innerHTML = html;
}
