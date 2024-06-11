import {
  extrato,
  bolsaHoje,
  poupancaMensal,
  formata,
  calcRentabilidade,
  calcValorFuturo,
} from "/functions/index.js";

const template = `
<div class="card mb-4 shadow-lg">
  <div class="card-body">
    <h5 class="card-title text-uppercase">Projeções</h5>
	  <p class="card-text small">Simulando a rentabilidade se mantiver na cotação atual e recebendo proventos.</p>
    <div class= "row">
      <div class="col">
        <table class="table text-end">
          <thead>
            <tr>
              <th colspan="2">6 meses</th>
            </tr>
          </thead>
          <tbody class="table-group-divider">
            <% em6meses.forEach((item) => { %>
            <tr>
              <th class="text-start"><%= item.codigo %></th>
              <td><%- formata(item.em6meses, ['porcentagem', 'negativo']) %></td>
            </tr>
            <% }); %>
          <tbody>
          <tfoot class="table-group-divider">
            <tr>
              <th class="text-start">Carteira</th>
              <td><%- formata(carteira6meses, ['porcentagem', 'negativo']) %></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div class="col">
        <table class="table text-end">
          <thead>
            <tr>
              <th colspan="2">12 meses</th>
            </tr>
          </thead>
          <tbody class="table-group-divider">
            <% em12meses.forEach((item) => { %>
            <tr>
              <th class="text-start"><%= item.codigo %></th>
              <td><%- formata(item.em12meses, ['porcentagem', 'negativo']) %></td>
            </tr>
            <% }); %>
          <tbody>
          <tfoot class="table-group-divider">
            <tr>
              <th class="text-start">Carteira</th>
              <td><%- formata(carteira12meses, ['porcentagem', 'negativo']) %></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</div>
`;

/**
 *  Widget que mostra uma projeção para os próximos meses
 */
export default function WidgetProjecao(element) {
  let ativos = element.getAttribute("data-ativos");
  ativos = ativos.split(",");

  let projecao = [];
  let compras = [];
  let investimento = 0;
  let carteira6meses = 0;
  let carteira12meses = 0;

  ativos.forEach((codigo) => {
    const ativo = extrato().codigo(codigo);
    let investido = ativo.investido;
    let quantidade = ativo.quantidade;
    let cotacao = bolsaHoje(codigo);
    let posicao = cotacao * quantidade;
    let proventos = ativo.proventos().valor;
    let media = ativo.proventos().valorMedio;
    projecao.push({
      codigo,
      em6meses: calcRentabilidade(media * 6 + (posicao + proventos), investido),
      em12meses: calcRentabilidade(
        media * 12 + (posicao + proventos),
        investido
      ),
    });
    compras.push(ativo.compras().dados[0].data);
    investimento += investido;
    carteira6meses += media * 6 + (posicao + proventos);
    carteira12meses += media * 12 + (posicao + proventos);
  });

  carteira6meses = calcRentabilidade(carteira6meses, investimento);
  carteira12meses = calcRentabilidade(carteira12meses, investimento);

  // Projeção da poupança

  compras.sort((a, b) => a - b);
  let de = luxon.DateTime.fromMillis(compras[0]);
  let ate = luxon.DateTime.now();
  let decorrido = luxon.Interval.fromDateTimes(de, ate).length("months");

  let poupanca = poupancaMensal(ate.minus({ months: 12 })).map(
    (item) => item.valor
  );
  poupanca = poupanca.reduce((s, v) => (s += v), 0) / poupanca.length;

  projecao.push({
    codigo: "Poupança",
    em6meses: calcRentabilidade(
      calcValorFuturo(investimento, poupanca, decorrido + 6),
      investimento
    ),
    em12meses: calcRentabilidade(
      calcValorFuturo(investimento, poupanca, decorrido + 12),
      investimento
    ),
  });

  let em6meses = [...projecao].sort((a, b) => b.em6meses - a.em6meses);
  let em12meses = [...projecao].sort((a, b) => b.em12meses - a.em12meses);

  let html = ejs.render(template, {
    em6meses,
    em12meses,
    carteira6meses,
    carteira12meses,
    formata,
  });
  element.innerHTML = html;
}
