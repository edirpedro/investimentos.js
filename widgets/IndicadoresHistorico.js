import { cdiMensal, poupancaMensal, ipcaMensal } from "/functions/index.js";

const template = `
<div class="card mb-4 shadow-lg">
  <div class="card-body">
    <div class="card-title mb-4">
      <h5 class="text-uppercase">Últimos 5 anos</h5>
    </div>
    <div class="chart" style="height:200px"></div>
  </div>
</div>
`;

/**
 * Widget que mostra os indicadores juntos num período de 5 anos
 */
export default function WidgetIndicadoresHistorico(element) {
  let series = [];
  let hoje = luxon.DateTime.now();

  series.push({
    name: "CDI",
    type: "line",
    symbol: "none",
    data: cdiMensal(
      hoje.minus({ years: 5 }),
      hoje.startOf("month").minus({ days: 1 })
    ).map((item) => [item.data, item.valor]),
  });

  series.push({
    name: "Poupança",
    type: "line",
    symbol: "none",
    data: poupancaMensal(
      hoje.minus({ years: 5 }),
      hoje.startOf("month").minus({ days: 1 })
    ).map((item) => [item.data, item.valor]),
  });

  series.push({
    name: "IPCA",
    type: "line",
    symbol: "none",
    data: ipcaMensal(
      hoje.minus({ years: 5 }),
      hoje.startOf("month").minus({ days: 1 })
    ).map((item) => [item.data, item.valor]),
  });

  let html = ejs.render(template);
  element.innerHTML = html;

  // Gráfico

  let options = {
    series,
    xAxis: {
      type: "time",
      splitLine: {
        show: false,
      },
      axisLine: {
        show: false,
        onZero: false,
      },
    },
    yAxis: {
      type: "value",
      splitLine: {
        show: false,
      },
    },
    grid: {
      top: 5,
      left: 5,
      right: 5,
    },
    legend: {
      show: true,
      bottom: 0,
    },
    tooltip: {
      trigger: "axis",
      valueFormatter: (value) => (value ? value.toFixed(4) + "%" : value),
      axisPointer: {
        label: {
          formatter: (params) => {
            return luxon.DateTime.fromMillis(params.value).toFormat(
              "LLLL yyyy"
            );
          },
        },
      },
    },
  };

  var chart = echarts.init(element.querySelector(".chart"), "tema", {
    locale: "PT-br",
  });
  chart.setOption(options);
  window.addEventListener("resize", function () {
    chart.resize();
  });
}
