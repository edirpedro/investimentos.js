import {
  extrato,
  cdiDiario,
  ipcaMensal,
  poupancaCorrigida,
  formata,
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
    <b>Período:</b> <%= resultado.periodo %><br/>
    <b>Investido:</b> <%= formata(resultado.investido, 'BRL') %><br/>
    <% if(resultado.resgatado) { %>
    <b>Resgate:</b> <%= formata(resultado.resgate, 'BRL') %><br/>
    <b>Taxas:</b> <%= formata(resultado.taxas, 'BRL') %><br/>
    <b>Líquido:</b> <%= formata(resultado.liquido, 'BRL') %><br/>
    <% } %>
  </div>
  <hr />
  <div class="row px-3 pb-4 justify-content-between text-center">
    <% if(resultado.resgatado) { %>
    <div class="col">
      <div class="fw-bold">Rendeu</div>
      <% if (resultado.acimaPoupanca) { %>
        <span class="text-success fw-bold"><%= formata(resultado.rentabilidade, 'porcentagem') %></span>
      <% } else { %>
        <span class="text-danger fw-bold"><%= formata(resultado.rentabilidade, 'porcentagem') %></span>
      <% } %>
    </div>
    <% } %>
    <div class="col">
      <div class="fw-bold">CDI</div>
      <%= formata(resultado.cdi, 'porcentagem') %>
    </div>
    <div class="col">
      <div class="fw-bold">Poupança</div>
      <%= formata(resultado.poupanca, 'porcentagem') %>
    </div>
    <div class="col">
      <div class="fw-bold">IPCA</div>
      <%= formata(resultado.ipca, 'porcentagem') %>
    </div>
  </div>
</div>`;

/**
 *  Widget que mostra um investimento em Renda Fixa
 */
export default function WidgetRendaFixa(element) {
  let nome = element.getAttribute("data-produto");
  const produto = extrato().produto(nome);

  let compras = produto.compras().dados;
  let vendas = produto.vendas().dados;
  let dataCompra = luxon.DateTime.fromMillis(compras.at(0).data);
  let dataVenda = luxon.DateTime.now();
  if (vendas.at(-1)) dataVenda = luxon.DateTime.fromMillis(vendas.at(-1).data);

  let investido = produto.investimento;
  let resgate = produto.resgatado;
  let taxas = Math.abs(produto.taxas().valor + produto.impostos().valor);
  let liquido = resgate - taxas;

  let resultado = {
    titulo: nome.split(" ")[0],
    produto: nome,
    investido,
    resgate,
    taxas,
    liquido,
    periodo: luxon.Interval.fromDateTimes(
      dataCompra,
      dataVenda
    ).toLocaleString(),
    dias: luxon.Interval.fromDateTimes(
      dataCompra.startOf("day"),
      dataVenda.startOf("day")
    ).length("days"),
    rentabilidade: calcRentabilidade(liquido, investido),
  };

  // CDI
  resultado.cdi = cdiDiario(dataCompra, dataVenda, true).at(-1).valor;

  // IPCA
  resultado.ipca = ipcaMensal(dataCompra, dataVenda, true).at(-1).valor;

  // Poupança, com ajuste de data final para calcular o período completo
  if (dataVenda.day < dataCompra.day)
    dataVenda = dataVenda.plus({ days: dataCompra.day - dataVenda.day });
  resultado.poupanca = calcRentabilidade(
    poupancaCorrigida(investido, dataCompra.toMillis(), dataVenda.toMillis()),
    investido
  );

  resultado.acimaPoupanca = resultado.rentabilidade > resultado.poupanca;
  resultado.resgatado = resgate > 0;

  let html = ejs.render(template, { resultado, formata });
  element.innerHTML = html;
}
