import { extrato } from "/functions/index.js";

const template = `
<div class="row">
<% ativos.forEach((ativo) => { %>
  <div data-widget="PrecoMedio" data-ativo="<%= ativo %>" class="col-4"></div>
<% }); %>
</div>
`;

/**
 * Página que mostra se o preço médio esta acima ou abaixo da cotação
 */
export default function PagePrecoMedio(element) {
  let ativos = extrato().produtos("ativos");
  ativos = ativos.filter((ativo) => extrato().codigo(ativo).quantidade > 0);

  let html = ejs.render(template, { ativos });
  element.innerHTML = html;
}
