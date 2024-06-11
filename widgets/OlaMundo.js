const template = `Olá <%= nome %>!`;

export default function WidgetOlaMundo(element) {
  let nome = element.getAttribute("data-nome");
  let html = ejs.render(template, { nome });
  element.innerHTML = html;
}
