import { extrato } from "/functions/index.js";

const template = `
<div class="card mb-4 shadow-lg">
  <div class="card-body">
    <h5 class="card-title text-uppercase">Distribuição</h5>
    <div class="chart" style="min-width:300px;width:100%;height:300px"></div>
  </div>
</div>
`;

export default function WidgetDistribuicao(element) {
  let ativos = element.getAttribute("data-ativos");
  ativos = ativos.split(",");

  element.innerHTML = template;

  let dados = [];
  ativos.forEach((ativo) => {
    dados.push({
      name: ativo,
      value: extrato().codigo(ativo).investido,
    });
  });

  let options = {
    series: [
      {
        type: "pie",
        data: dados,
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 5,
          borderColor: "rgba(33, 37, 41, 0.5)",
          borderWidth: 2,
        },
        label: {
          formatter: (params) =>
            params.name + "\n" + params.percent.toFixed(1) + "%",
        },
      },
    ],
  };

  var chart = echarts.init(element.querySelector(".chart"), "tema");
  chart.setOption(options);
  window.addEventListener("resize", function () {
    chart.resize();
  });
}
