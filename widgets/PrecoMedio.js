import { extrato, bolsaCotacoes, formata } from "/functions/index.js";

const template = `
<div class="card mb-4 shadow-lg">
  <div class="card-body">
    <h5 class="card-title"><%= ativo %></h5>
    <div class="chart" style="height:200px;"></div>
  </div>
</div>
`;

/**
 *  Widget que mostra se o preço médio esta acima ou abaixo da cotação
 */
export default function WidgetPrecoMedio(element) {
  let ativo = element.getAttribute("data-ativo");
  let precoMedio = extrato().codigo(ativo).precoMedio;
  let cotacoes = bolsaCotacoes(ativo);
  cotacoes = cotacoes ? cotacoes.slice(-30) : [];

  let series = [
    {
      name: ativo,
      type: "line",
      data: cotacoes.map((item) => [item.data, item.valor]),
    },
  ];

  let html = ejs.render(template, { ativo });
  element.innerHTML = html;

  grafico(element, series, precoMedio);
}

// Gráfico

function grafico(element, series, precoMedio) {
  let valores = series[0].data.map((item) => item[1]);
  valores.push(precoMedio + 0.1); // para não conflitar com o markline

  series[0] = Object.assign(
    {
      markLine: {
        data: [
          {
            name: "Preço Médio",
            yAxis: precoMedio,
          },
        ],
        symbol: "none",
        label: {
          position: "insideEndTop",
          formatter: (params) => formata(params.value, "BRL"),
          fontWeight: "bold",
        },
      },
      lineStyle: {
        width: 3,
      },
      showSymbol: false,
      areaStyle: {
        origin: "start",
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: "rgba(13, 110, 253, .5)",
            },
            {
              offset: 1,
              color: "rgba(13, 110, 253, 0)",
            },
          ],
        },
      },
    },
    series[0]
  );

  let options = {
    series,
    xAxis: {
      type: "time",
      splitLine: {
        show: false,
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        show: false,
      },
    },
    yAxis: {
      type: "value",
      splitLine: {
        show: false,
      },
      min: Math.min(...valores),
      max: Math.max(...valores),
    },
    grid: {
      top: 20,
      left: 5,
      right: 5,
      bottom: 5,
    },
    legend: {
      show: false,
    },
    tooltip: {
      trigger: "axis",
      valueFormatter: (value) => formata(value, "BRL"),
      axisPointer: {
        label: {
          formatter: (params) => {
            let data = luxon.DateTime.fromMillis(parseInt(params.value));
            return data.toLocaleString();
          },
        },
      },
    },
  };

  var chart = echarts.init(element.querySelector(".chart"), "tema");
  chart.setOption(options);
  window.addEventListener("resize", function () {
    chart.resize();
  });
}
