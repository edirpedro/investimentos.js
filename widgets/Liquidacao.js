import { extrato, bolsaHoje, calculoDARF, formata } from "/functions/index.js";

const template = `
<div class="card mb-4 shadow-lg">
  <div class="card-body">
    <h5 class="card-title text-uppercase">Venda</h5>
    <p class="card-text small">Cálculo para fins de liquidação do ativo.</p>
    <table class="table">
      <thead>
        <tr>
          <td></td>
          <th>DARF</th>
          <th>Valor</th>
        </tr>
      </thead>
      <tbody class="table-group-divider">
        <% liquidacao.forEach((item) => { %>
        <tr>
          <th><%= item.codigo %></th>
          <td><%- formata(item.imposto, 'BRL') %></td>
          <td><%- formata(item.valor, 'BRL') %></td>
        </tr>
        <% }); %>
      </tbody>
    </table>
  </div>
</div>
`;

/**
 *  Widget que mostra o cálculo para liquidação dos ativos
 */
export default function WidgetLiquidacao(element) {
  let ativos = element.getAttribute("data-ativos");
  ativos = ativos.split(",");

  let liquidacao = [];

  ativos.forEach((codigo) => {
    const ativo = extrato().codigo(codigo);
    let investido = ativo.investido;
    let quantidade = ativo.quantidade;
    let cotacao = bolsaHoje(codigo);
    let valor = cotacao * quantidade;
    let imposto = calculoDARF(investido, valor);
    liquidacao.push({ codigo, imposto, valor });
  });

  let html = ejs.render(template, { liquidacao, formata });
  element.innerHTML = html;
}
