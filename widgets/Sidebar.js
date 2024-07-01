import config from "/config.js";
import { extrato, bolsaCotacoes } from "/functions/index.js";

const template = `
<div class="d-flex flex-column flex-shrink-0 ps-5 pb-4 text-end">
  <div class="fs-4 mx-3 my-5">Investimentos.js</div>
  <ul class="nav nav-pills flex-column mb-auto">
    <% menu.forEach((item) => { %>
    <li class="nav-item">
      <a href="/?page=<%= item.componente %>" class="nav-link text-white <%= item.active ? 'active' : '' %>">
        <%= item.nome %>
      </a>
    </li>
    <% }); %>
  </ul>
  <div>
    <a href="https://github.com/edirpedro/investimentos.js" target="_blank" class="btn btn-dark"><i class="bi bi-github"></i></a>
    <button id="atualizarDados" class="btn btn-outline-light" title="Atualizar"><i class="bi bi-arrow-repeat"></i></button>
  </div>
  <hr />
  <small>Extrato <%= dataExtrato %></small>
  <small>Cotações <%= dataCotacoes %></small>
</div>
`;

/**
 *  Widget que monta o menu lateral do aplicativo
 */
export default function WidgetSidebar(element) {
  const params = new URLSearchParams(window.location.search);
  let menu = config.pages.map((item) => {
    item.active = params.get("page") == item.componente;
    return item;
  });
  if (params.size === 0) menu[0].active = true;

  const ultimo = extrato().dados.at(-1);
  const dataExtrato = luxon.DateTime.fromMillis(ultimo.data).toLocaleString();
  const dataCotacoes = luxon.DateTime.fromMillis(
    bolsaCotacoes("^BVSP").at(-1).data
  ).toLocaleString();

  let html = ejs.render(template, { menu, dataExtrato, dataCotacoes });
  element.innerHTML = html;

  // Botão para atualizar os dados

  document.querySelector("#atualizarDados").addEventListener("click", () => {
    fetch(config.proxy + "?refresh");
    window.location.reload();
  });
}
