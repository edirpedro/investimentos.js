import { App, extrato } from "/functions/index.js";

const template = `
<div class="row">
  <div class="col-4">
    <div class="card shadow-lg lista-produtos">
      <div class="card-header">Produtos</div>
      <div class="card-body">
        <ul class="list-group list-group-flush">
          <% produtos.forEach((produto) => { %>
          <li class="list-group-item list-group-item-action"><%= produto %></li>
          <% }); %>
        </ul>
      </div>
    </div>
  </div>
  <div class="col-8">
    <div id="widgetExtrato"></div>
  </div>
</div>
<style>
.lista-produtos { position: sticky; top: 3rem; }
.lista-produtos .card-body { max-height: calc(100vh - 10rem); padding: 0; overflow: auto; }
.lista-produtos li { cursor: pointer; }
</style>
`;

/**
 *  Página que mostra os registros de extrato de um produto
 */
export default function PageExtrato(element) {
  let produtos = extrato().produtos();
  produtos.sort((a, b) => a.localeCompare(b));

  let html = ejs.render(template, { produtos });
  element.innerHTML = html;

  // Lista

  const widget = element.querySelector("#widgetExtrato");
  const lista = element.querySelectorAll(".list-group-item");
  lista.forEach((item) =>
    item.addEventListener("click", (event) => {
      let produto = event.target.innerText;
      widget.innerHTML = `<section data-widget="Extrato" data-produto="${produto}"></section>`;
      App.render(widget);
      lista.forEach((item) => item.classList.remove("active"));
      event.target.classList.toggle("active");
    })
  );
}
