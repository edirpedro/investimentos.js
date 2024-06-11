import {
  extrato,
  cdiDiario,
  ipcaMensal,
  poupancaCorrigida,
  formata,
  tesouroValorUnitario,
  calcRentabilidade,
} from "/functions/index.js";

const template = `
<div class="card h-100 shadow-lg">
  <div class="card-body">
    <div class="card-title hstack gap-2">
      <span class="me-auto fs-5 text-uppercase"><%= resultado.titulo %></span>
      <span class="badge text-bg-light"><%= resultado.dias %> dias</span>
    </div>
    <p class="card-text small"><%= resultado.produto %></p>
  </div>
  <div class="px-3">
    <ul class="list-group list-group-flush">
      <li class="list-group-item hstack"><b class="me-auto">Período</b><%- resultado.periodo %></li>
      <li class="list-group-item hstack"><b class="me-auto">Investimento</b><%- formata(resultado.investimento, 'BRL') %></li>
      <li class="list-group-item hstack"><b class="me-auto">Valor atual</b><%- formata(resultado.valor, 'BRL') %></li>
      <li class="list-group-item hstack"><b class="me-auto">Juros</b><%- formata(resultado.juros, 'BRL') %></li>
      <li class="list-group-item hstack"><b class="me-auto">Impostos</b><%- formata(resultado.impostos, 'BRL') %></li>
      <li class="list-group-item hstack"><b class="me-auto">Taxas</b><%- formata(resultado.taxas, 'BRL') %></li>
      <li class="list-group-item hstack"><b class="me-auto">Imposto ao resgatar</b><%- formata(resultado.impostoResgate, 'BRL') %></li>
      <li class="list-group-item hstack"><b class="me-auto">Total Líquido</b><%- formata(resultado.liquido, 'BRL') %></li>
    </ul>
  </div>
  <hr />
  <div class="row px-3 pb-4 justify-content-between text-center">
    <div class="col">
      <div class="fw-bold">Rendeu</div>
      <% if (resultado.acimaPoupanca) { %>
        <span class="text-success fw-bold"><%- formata(resultado.rentabilidade, 'porcentagem') %></span>
      <% } else { %>
        <span class="text-danger fw-bold"><%- formata(resultado.rentabilidade, 'porcentagem') %></span>
      <% } %>
    </div>
    <div class="col">
      <div class="fw-bold">CDI</div>
      <%- formata(resultado.cdi, 'porcentagem') %>
    </div>
    <div class="col">
      <div class="fw-bold">Poupança</div>
      <%- formata(resultado.poupanca, 'porcentagem') %>
    </div>
    <div class="col">
      <div class="fw-bold">IPCA</div>
      <%- formata(resultado.ipca, 'porcentagem') %>
    </div>
  </div>
</div>`;

/**
 *  Widget que mostra o resultado de um investimento em Tesouro Direto
 */
export default function WidgetTesouro(element) {
  let nome = element.getAttribute("data-produto");
  const produto = extrato().produto(nome);

  let compras = produto.compras().dados;
  let vendas = produto.vendas().dados;
  let dataCompra = luxon.DateTime.fromMillis(compras.at(0).data);
  let dataVenda = luxon.DateTime.now();
  // Se pagar juros, calcula somente até o último juros pago para equivaler com os indicadores
  if (nome.indexOf("Juros Semestrais"))
    dataVenda = luxon.DateTime.fromMillis(produto.juros().dados.at(-1).data);

  let investimento = produto.investimento;
  let quantidade = produto.quantidade;
  let valor = tesouroValorUnitario(nome) * quantidade;
  let juros = produto.juros().valor;
  let taxas = Math.abs(produto.taxas().valor);
  let impostos = Math.abs(produto.impostos().valor);
  let impostoResgate = (valor - investimento) * 0.15;
  let liquido = valor + juros - taxas - impostos - impostoResgate;

  let resultado = {
    titulo: nome.split(" ").slice(0, 2).join(" "),
    produto: nome,
    investimento,
    valor,
    juros,
    taxas,
    impostos,
    impostoResgate,
    liquido,
    periodo: luxon.Interval.fromDateTimes(
      dataCompra,
      dataVenda
    ).toLocaleString(),
    dias: luxon.Interval.fromDateTimes(
      dataCompra.startOf("day"),
      dataVenda.startOf("day")
    ).length("days"),
    rentabilidade: calcRentabilidade(liquido, investimento),
  };

  // CDI
  resultado.cdi = cdiDiario(dataCompra, dataVenda, true).at(-1).valor;

  // IPCA
  resultado.ipca = ipcaMensal(dataCompra, dataVenda, true).at(-1).valor;

  // Poupança, com ajuste de data final para calcular o período total
  if (dataVenda.day < dataCompra.day)
    dataVenda = dataVenda.plus({ days: dataCompra.day - dataVenda.day });
  resultado.poupanca = calcRentabilidade(
    poupancaCorrigida(
      investimento,
      dataCompra.toMillis(),
      dataVenda.toMillis()
    ),
    investimento
  );

  resultado.acimaPoupanca = resultado.rentabilidade > resultado.poupanca;

  let html = ejs.render(template, { resultado, formata });
  element.innerHTML = html;
}
