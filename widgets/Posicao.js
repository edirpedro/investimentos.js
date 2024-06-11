import { extrato, bolsaHoje, formata } from "/functions/index.js";

const template = `
<div class="card mb-4 shadow-lg">
  <div class="card-body">
    <h5 class="card-title text-uppercase">Posição</h5>
    <p class="card-text small">Como estão os ativos hoje.</p>
    <table class="table text-end">
      <thead>
        <tr>
          <td></td>
          <th>Quantidade</th>
          <th>Preço Médio</th>
          <th>Cotação</th>
        </tr>
      </thead>
      <tbody class="table-group-divider">
        <% resultado.forEach((item) => { %>
        <tr>
          <th class="text-start"><%= item.codigo %></th>
          <td><%= item.quantidade %></td>
          <td><%- formata(item.precoMedio, 'BRL') %></td>
          <td><%- formata(item.cotacao, 'BRL') %></td>
        </tr>
        <% }); %>
      <tbody>
    </table>
  </div>
</div>
`;

/**
 *  Widget que mostra as posições atuais dos ativos
 */
export default function WidgetPosicao(element) {
  let ativos = element.getAttribute("data-ativos");
  ativos = ativos.split(",");

  let resultado = [];

  ativos.forEach((codigo) => {
    const ativo = extrato().codigo(codigo);
    resultado.push({
      codigo,
      quantidade: ativo.quantidade,
      cotacao: bolsaHoje(codigo),
      precoMedio: ativo.precoMedio,
    });
  });

  let html = ejs.render(template, { resultado, formata });
  element.innerHTML = html;
}
