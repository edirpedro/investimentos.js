import { App, extrato } from "/functions/index.js";

const template = `
<select class="form-select mb-5">
  <option value="">Selecione um produto</option>
  <% produtos.forEach((produto) => { %>
  <option><%= produto %></option>
  <% }); %>
</select>
<div id="widgetExtrato"></div>
`;

/**
 *  Página que mostra os registros de extrato de um produto
 */
export default function PageExtrato(element) {
  let produtos = extrato().produtos();
  produtos.sort((a, b) => a.localeCompare(b));

  let html = ejs.render(template, { produtos });
  element.innerHTML = html;

  // Seletor

  const widget = element.querySelector("#widgetExtrato");
  const select = element.querySelector("select");
  select.addEventListener("change", (event) => {
    let produto = event.target.value;
    widget.innerHTML = produto
      ? `<section data-widget="Extrato" data-produto="${produto}"></section>`
      : "";
    App.render(widget);
  });
}
