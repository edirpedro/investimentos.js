import { extrato } from "/functions/index.js";

const template = `
<h5 class="mb-5 mx-3 text-uppercase">Contratos</h5>
<div class="row row-cols-1 row-cols-lg-2 row-cols-xl-3 g-5">
  <% contratos.forEach((produto) => { %>
  <div class="col">
    <div data-widget="RendaFixa" data-produto="<%= produto %>"></div>
  </div>
  <% }); %>
</div>
<h5 class="my-5 mx-3 text-uppercase">Vencidos</h5>
<div class="row row-cols-1 row-cols-lg-2 row-cols-xl-3 g-5">
  <% vencidos.forEach((produto) => { %>
  <div class="col">
    <div data-widget="RendaFixa" data-produto="<%= produto %>"></div>
  </div>
  <% }); %>
</div>
`;

/**
 *  Página que mostra os investimentos em Renda Fixa
 */
export default function PageRendaFixa(element) {
  let contratos = [];
  let vencidos = [];
  let produtos = extrato().produtos("rendafixa");

  produtos.forEach((nome) => {
    const produto = extrato().produto(nome);
    const vencido = produto.busca("movimentacao", "VENCIMENTO");
    if (vencido.dados.length) vencidos.push(nome);
    else contratos.push(nome);
  });

  let html = ejs.render(template, { contratos, vencidos });
  element.innerHTML = html;
}
