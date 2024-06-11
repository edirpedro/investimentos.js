import { extrato, bolsaSimbolo, bolsaHoje, formata } from "/functions/index.js";

const template = `
<div class="card mb-4 shadow-lg">
  <div class="card-body">
    <h5 class="card-title hstack gap-2">
      <span class="me-auto text-uppercase">Cotações</span>
    </h5>
    <p class="card-text small">Quanto os ativos estão valendo hoje.</p>
    <table class="table text-end">
      <thead>
        <tr>
          <td></td>
          <th>PM</th>
          <th>Valor</th>
          <th>Mínimo</th>
          <th>Máximo</th>
        </tr>
      </thead>
      <tbody class="table-group-divider">
        <% resultado.forEach((item) => { %>
        <tr>
          <th class="text-start"><%= item.codigo %></th>
          <td><%- formata(item.precoMedio, 'BRL') %></td>
          <td class="<%= item.cor %>"><%- formata(item.cotacao, 'BRL') %></td>
          <td><%- formata(item.minimo, 'BRL') %></td>
          <td><%- formata(item.maximo, 'BRL') %></td>
        </tr>
        <% }); %>
      <tbody>
    </table>
  </div>
</div>
`;

/**
 *  Widget que mostra as cotações atuais dos ativos
 */
export default function WidgetCotacoes(element) {
  let ativos = element.getAttribute("data-ativos");
  ativos = ativos.split(",");

  let resultado = [];

  ativos.forEach((codigo) => {
    const ativo = extrato().codigo(codigo);
    const precoMedio = ativo.precoMedio;
    const dados = bolsaSimbolo(codigo);
    const cotacao = bolsaHoje(codigo);
    resultado.push({
      codigo,
      minimo: dados.fiftyTwoWeekLow,
      maximo: dados.fiftyTwoWeekHigh,
      cotacao,
      precoMedio,
      cor: cotacao < precoMedio ? "text-danger" : "",
    });
  });

  let html = ejs.render(template, { resultado, formata });
  element.innerHTML = html;
}
