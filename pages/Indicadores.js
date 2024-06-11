const template = `
<section data-widget="IndicadoresHistorico"></section>
<div class="row">
  <section
    data-widget="Indicador"
    data-indicador="poupanca"
    class="col"
  ></section>
  <section
    data-widget="Indicador"
    data-indicador="ipca"
    class="col"
  ></section>
</div>
<div class="row">
  <section
    data-widget="Indicador"
    data-indicador="selic"
    class="col"
  ></section>
  <section
    data-widget="Indicador"
    data-indicador="cdi"
    class="col"
  ></section>
</div>
`;

/**
 *  Página que mostra os indicadores financeiros
 */
export default function PageIndicadores(element) {
  let html = ejs.render(template);
  element.innerHTML = html;
}
