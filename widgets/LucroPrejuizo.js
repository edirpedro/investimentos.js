import { extrato, bolsaHoje, formata } from "/functions/index.js";

const template = `
<div class="card mb-4 shadow-lg">
  <div class="card-body">
    <h5 class="card-title hstack gap-2">
      <span class="me-auto text-uppercase">Lucro/Prejuízo</span>
      <span class="badge text-bg-light"><%- formata(total, ['BRL', 'negativo']) %></span>
    </h5>
    <p class="card-text small">Valor atual mais proventos menos o valor investido.</p>
    <ol class="list-group list-group-numbered list-group-flush">
      <% resultado.forEach((item) => { %>
      <li class="list-group-item hstack gap-2">
        <strong class="me-auto"><%= item.codigo %></strong>
        <%- formata(item.valor, ['BRL', 'negativo']) %>
      </li>
      <% }); %>
    </ol>
  </div>
</div>
`;

/**
 *  Widget que mostra o lucro ou prejuízo dos ativos
 */
export default function WidgetLucroPrejuizo(element) {
  let ativos = element.getAttribute("data-ativos");
  ativos = ativos.split(",");

  let resultado = [];

  ativos.forEach((codigo) => {
    const ativo = extrato().codigo(codigo);
    let investido = ativo.investido;
    let quantidade = ativo.quantidade;
    let cotacao = bolsaHoje(codigo);
    let posicao = cotacao * quantidade;
    let proventos = ativo.proventos().valor;
    resultado.push({
      codigo,
      valor: posicao + proventos - investido,
    });
  });

  let total = resultado.reduce((sum, item) => (sum += item.valor), 0);

  resultado.sort((a, b) => b.valor - a.valor);

  let html = ejs.render(template, { resultado, total, formata });
  element.innerHTML = html;
}
