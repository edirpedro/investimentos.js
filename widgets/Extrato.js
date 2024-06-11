import { extrato, formata } from "/functions/index.js";

const template = `
<div class="card mb-4 shadow-lg">
  <div class="card-body">
    <h5 class="card-title text-uppercase">Extrato</h5>
    <p class="card-text small"><%= nome %></p>
    <ul class="list-group list-group-flush extrato-scroll">
    <% dados.forEach((item) => { %>
      <li class="list-group-item hstack gap-3">
        <% if(item.tipo == 'CREDITO') { %>
          <i class="bi bi-plus-circle"></i>
        <% } else { %>
          <i class="bi bi-dash-circle"></i>
        <% } %>
        <div class="me-auto">
          <b><%= item.movimentacao %></b><br />
          <% if(item.quantidade > 0) { %>
            Quantidade: <%= formata(item.quantidade, 'numero') %><br/>
          <% } %>
          <% if(item.preco > 0) { %>
            Preço unitário: <%= formata(item.preco, 'BRL') %><br/>
          <% } %>
          <% if(item.valor > 0) { %>
            Valor da operação: <%= formata(item.valor, 'BRL') %><br/>
          <% } %>
          <%= item.instituicao %>
        </div>
        <div>
          <%= item.data.toLocaleString() %>
        </div>
      </li>
    <% }); %>
    </ul>
  </div>
</div>
<style>
x.extrato-scroll { max-height: 500px; overflow: auto; }
</style>
`;

/**
 *  Widget que mostra os registros de um produto existentes no extrato
 */
export default function WidgetExtrato(element) {
  const codigos = extrato().produtos("ativos");
  let produto = element.getAttribute("data-produto");
  let ativo = codigos.find((codigo) => produto.indexOf(codigo) === 0);
  let dados;

  if (ativo) dados = extrato().codigo(ativo).dados;
  else if (produto) dados = extrato().busca("produto", produto).dados;

  dados.sort((a, b) => b.data - a.data);
  dados.forEach((item) => (item.data = luxon.DateTime.fromMillis(item.data)));
  let nome = dados[0].produto;

  let html = ejs.render(template, { dados, nome, formata });
  element.innerHTML = html;
}
