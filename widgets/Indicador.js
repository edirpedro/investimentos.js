import {
  formata,
  poupancaMensal,
  poupancaMediaAno,
  poupancaAcumuladoAno,
  ipcaMensal,
  ipcaMediaAno,
  ipcaAcumuladoAno,
  cdiMensal,
  cdiMediaAno,
  cdiAcumuladoAno,
  selicMensal,
  selicMediaAno,
  selicAcumuladoAno,
} from "/functions/index.js";

const template = `
<div class="card mb-4 shadow-lg">
  <div class="card-body">
    <div class="card-title mb-4">
      <h5 class="text-uppercase"><%= titulo %></h5>
    </div>
    <div class="row">
      <div class="col"></div>
      <div class="col"></div>
      <div class="col">
        <h6>Mensal</h6>
        <p><span class="badge rounded-pill text-bg-primary"><%= formata(resultado.mensal, 'porcentagem') %></span></p>
      </div>
      <div class="col">
        <h6>Anual</h6>
        <p><span class="badge rounded-pill text-bg-primary"><%= formata(resultado.anual, 'porcentagem')%></span></p>
      </div>
    </div>
    <div class="chart" style="height:200px"></div>
  </div>
</div>
`;

/**
 *  Widget que mostra informações sobre um indicador
 */
export default function WidgetIndicador(element) {
  let nome = element.getAttribute("data-indicador");

  let titulo, indicador, mensal, anual, de, ate;
  let series = [];

  switch (nome) {
    case "poupanca":
      titulo = "Poupança";
      indicador = poupancaMensal;
      mensal = poupancaMediaAno();
      anual = poupancaAcumuladoAno();
      break;
    case "ipca":
      titulo = "IPCA";
      indicador = ipcaMensal;
      mensal = ipcaMediaAno();
      anual = ipcaAcumuladoAno();
      break;
    case "cdi":
      titulo = "CDI";
      indicador = cdiMensal;
      mensal = cdiMediaAno();
      anual = cdiAcumuladoAno();
      break;
    case "selic":
      titulo = "Selic";
      indicador = selicMensal;
      mensal = selicMediaAno();
      anual = selicAcumuladoAno();
      break;
  }

  // Ano atual

  de = luxon.DateTime.now().startOf("year");
  ate = luxon.DateTime.now().startOf("month").minus({ days: 1 }); // mês corrente é incompleto
  series.push({
    name: de.year,
    type: "line",
    data: indicador(de, ate).map((item) => item.valor),
  });

  // Ano passado

  de = luxon.DateTime.now().minus({ years: 1 }).startOf("year");
  ate = de.endOf("year");
  series.push({
    name: de.year,
    type: "line",
    data: indicador(de, ate).map((item) => item.valor),
  });

  // Últimos 12 meses

  let resultado = { mensal, anual };

  let html = ejs.render(template, { titulo, resultado, formata });
  element.innerHTML = html;

  grafico(element, series);
}

// Gráfico

function grafico(element, series) {
  let options = {
    series,
    xAxis: {
      type: "category",
      boundaryGap: false,
      splitLine: {
        show: false,
      },
      axisLine: {
        show: false,
        onZero: false,
      },
      axisLabel: {
        formatter: (value) => parseInt(value) + 1,
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
            return luxon.DateTime.fromObject({
              month: parseInt(params.value) + 1,
            }).monthLong;
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
