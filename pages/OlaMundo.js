const template = `
<div data-widget="OlaMundo" data-nome="Mundo"></div>
`;

export default function PageOlaMundo(element) {
  let html = ejs.render(template);
  element.innerHTML = html;
}
