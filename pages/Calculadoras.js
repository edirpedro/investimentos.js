const template = `
<div class="row">
  <div class="col-6" data-widget="CalculadoraPoupanca"></div>
</div>
`;

export default function PageCalculadoras(element) {
  let html = ejs.render(template);
  element.innerHTML = html;
}
