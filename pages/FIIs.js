import { extrato, bolsaHoje, calcRentabilidade } from "/functions/index.js";

const template = `
<div class="row">
  <div class="col-7">
    <section data-widget="Carteira" data-ativos="<%= codigos %>"></section>
    <section data-widget="CarteiraMensal"></section>
    <% ativos.forEach((ativo) => { %>
      <section data-widget="Carteira" data-ativos="<%= ativo %>"></section>
    <% }); %>
  </div>
  <div class="col-5">
    <section data-widget="Distribuicao" data-ativos="<%= codigos %>"></section>
    <section data-widget="Poupanca" data-ativos="<%= codigos %>"></section>
    <div class="row">
      <section data-widget="Desempenho" data-ativos="<%= codigos %>" class="col"></section>
      <section data-widget="LucroPrejuizo" data-ativos="<%= codigos %>" class="col"></section>
    </div>
    <section data-widget="Posicao" data-ativos="<%= codigos %>"></section>
    <section data-widget="Cotacoes" data-ativos="<%= codigos %>"></section>
    <section data-widget="Liquidacao" data-ativos="<%= codigos %>"></section>
    <section data-widget="Projecao" data-ativos="<%= codigos %>"></section>
  </div>
</div>
`;

/**
 *  Página com relatórios dos Fundos Imobiliários
 */
export default function PageFIIs(element) {
  let ativos = extrato().produtos("fiis");

  // Lista de ativos ordenada por rentabilidade

  ativos = ativos.map((codigo) => {
    const ativo = extrato().codigo(codigo);
    let investido = ativo.investido;
    let proventos = ativo.proventos().valor;
    let quantidade = ativo.quantidade;
    let cotacao = bolsaHoje(codigo);
    return [
      codigo,
      calcRentabilidade(cotacao * quantidade + proventos, investido),
    ];
  });
  ativos = ativos.sort((a, b) => b[1] - a[1]);
  ativos = ativos.map((item) => item[0]);

  let codigos = ativos.join(",");
  let html = ejs.render(template, { ativos, codigos });
  element.innerHTML = html;
}
