import { extrato } from "/functions/index.js";

const template = `
<div class="row row-cols-1 row-cols-lg-2 row-cols-xl-3 g-5">
  <% produtos.forEach((produto) => { %>
  <div class="col">
    <div data-widget="Tesouro" data-produto="<%= produto %>"></div>
  </div>
  <% }); %>
</div>
`;

/**
 *  Página que mostra os investimentos no Tesouro Direto
 */
export default function PageTesouro(element) {
  let produtos = extrato().produtos("tesouro");
  let html = ejs.render(template, { produtos });
  element.innerHTML = html;
}
