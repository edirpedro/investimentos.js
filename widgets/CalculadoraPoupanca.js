import {
  poupancaCorrigida,
  calcRentabilidade,
  formata,
} from "/functions/index.js";

const template = `
<div class="card mb-4 shadow-lg">
  <div class="card-body">
    <div class="card-title mb-4">
      <h5 class="text-uppercase">Poupança</h5>
      <p class="small">Corrige o valor pela poupança no período.</p>
    </div>
    <form class="row">
      <div class="col-6 mb-3">
        <label for="poupancaDe" class="form-label">Data inicial</label>
        <input type="date" class="form-control" id="poupancaDe">
      </div>
      <div class="col-6 mb-3">
        <label for="poupancaAte" class="form-label">Data final</label>
        <input type="date" class="form-control" id="poupancaAte">
      </div>
      <div class="col-12 mb-3">
        <label for="poupancaValor" class="form-label">Valor a ser corrigido</label>
        <div class="input-group">
          <span class="input-group-text" id="basic-addon1">R$</span>
          <input type="number" class="form-control" id="poupancaValor" step="0.01" min="0" placeholder="1000.00">
        </div>
      </div>
      <div class="col-12">
        <input type="submit" class="btn btn-primary" value="Calcular">
      </div>
      <div id="poupancaResultado"></div>
    </form>
  </div>
</div>
`;

export default function WidgetCalculadoraPoupanca(element) {
  let html = ejs.render(template);
  element.innerHTML = html;

  element.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();

    const form = event.target;
    const de = form.querySelector("#poupancaDe").value;
    const ate = form.querySelector("#poupancaAte").value;
    const valor = parseFloat(form.querySelector("#poupancaValor").value);
    const resultado = form.querySelector("#poupancaResultado");

    try {
      if (!valor || !de) throw Error;
      let correcao = poupancaCorrigida(valor, de, ate);
      let rentabilidade = calcRentabilidade(correcao, valor);
      correcao = formata(correcao, "BRL");
      rentabilidade = formata(rentabilidade, "porcentagem");
      resultado.innerHTML = `
      <div class="mt-3">
        <div class="hstack"><span>Valor corrigido:</span><span class="ms-auto">${correcao}</span></div>
        <div class="hstack"><span>Rentabilidade no período:</span><span class="ms-auto">${rentabilidade}</span></div>
      </div>
      `;
    } catch (e) {}
  });
}
