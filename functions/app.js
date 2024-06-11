import config from "/config.js";

// Objeto com controles para a aplicação

class __APP {
  constructor() {
    this.loads = [];
  }

  /**
   * Adiciona funções para execução no carregamento da aplicação
   * App.addLoad(function) - Adiciona uma ação
   * App.addLoad(function, 9) - Adiciona uma ação antes
   * App.addLoad(function, 20) - Adiciona uma ação depois
   * @param {function} callback - Função a ser executada
   * @param {number} priority - Prioridade na execução, abaixo de 10 executará primeiro e acima depois, conforme a ordem.
   */
  addLoad(callback, priority = 10) {
    this.loads.push({ callback, priority });
  }

  // Executa as chamadas de carregamento pela ordem de prioridade

  async load() {
    this.loads.sort((a, b) => a.priority - b.priority);
    for (let load of this.loads) await load.callback();
  }

  // Executa os processos para iniciar a aplicação

  async run() {
    document.body.classList.add("loading");
    await this.load();
    await this.page();
    this.render(document);
    document.body.classList.remove("loading");
  }

  // Renderiza um componente de página

  async page() {
    const params = new URLSearchParams(window.location.search);
    const name = params.size ? params.get("page") : config.pages[0].componente;
    const element = document.querySelector("main");
    try {
      await import(`/pages/${name}.js`).then(({ default: page }) => {
        element.classList.add("fadeIn");
        page(element);
      });
    } catch (e) {
      console.log(`Página ${name} gerou um erro!`);
      console.error(e);
    }
  }

  // Renderiza os widgets encontrados no elemento HTML.
  // App.render(html)

  render(element) {
    const widgets = element.querySelectorAll("[data-widget]");
    // const delay = 150;
    widgets.forEach(async (element, index) => {
      let name = element.getAttribute("data-widget");
      try {
        await import(`/widgets/${name}.js`).then(({ default: widget }) =>
          widget(element)
        );
        // const { default: widget } = await import(`/widgets/${name}.js`);
        // setTimeout(() => {
        //   widget(element);
        //   element.classList.add("fadeIn");
        // }, delay * index);
      } catch (e) {
        console.log(`Widget ${name} gerou um erro!`);
        console.error(e);
      }
    });
  }
}

export const App = new __APP();
