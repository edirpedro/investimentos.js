import {
  extrato,
  poupancaMensal,
  ipcaMensal,
  cdiMensal,
  bolsaMes,
  calcRentabilidade,
} from "/functions/index.js";

const template = `
<div class="card mb-4 shadow-lg">
  <div class="card-body">
    <h5 class="card-title text-uppercase">Carteira</h5>
    <div class="chart" style="height:250px"></div>
  </div>
</div>
`;

/**
 *  Widget que mostra o resumo da carteira de fundos imobiliários
 */
export default function WidgetCarteiraMensal(element) {
  let series = [];

  // Montando carteira

  let ativos = extrato().produtos("fiis");
  ativos = ativos.filter((codigo) => /11$/g.test(codigo));
  let carteira = consolida(ativos);

  series.push({
    name: "Carteira",
    type: "bar",
    data: carteira.map((item) => {
      return [
        item.data.startOf("month").toMillis(),
        calcRentabilidade(item.posicao + item.proventos, item.investido),
      ];
    }),
  });

  // Indicadores

  const serie = series[0].data;
  const de = luxon.DateTime.fromMillis(serie.at(0)[0]);
  const ate = luxon.DateTime.fromMillis(serie.at(-1)[0]);

  // Poupança
  series.push({
    name: "Poupança",
    type: "bar",
    data: poupancaMensal(de, ate).map((item) => {
      return [item.data, item.valor];
    }),
  });

  // IPCA
  series.push({
    name: "IPCA",
    type: "bar",
    data: ipcaMensal(de, ate).map((item) => {
      return [item.data, item.valor];
    }),
  });

  // CDI
  series.push({
    name: "CDI",
    type: "bar",
    data: cdiMensal(de, ate).map((item) => {
      return [item.data, item.valor];
    }),
  });

  let html = ejs.render(template);
  element.innerHTML = html;

  grafico(element, series);
}

// Gráfico

function grafico(element, series) {
  let options = {
    series,
    xAxis: {
      type: "category",
      axisLabel: {
        formatter: (value) => {
          let data = luxon.DateTime.fromMillis(parseInt(value));
          return data.toFormat("LLL");
        },
      },
    },
    yAxis: {
      type: "value",
      splitLine: {
        show: false,
      },
      // Centraliza a linha zero
      min: (value) => -Math.max(value.max, Math.abs(value.min)),
      max: (value) => Math.max(value.max, Math.abs(value.min)),
    },
    grid: {
      top: 0,
      left: 0,
      right: 0,
      containLabel: false,
    },
    legend: {
      show: true,
      bottom: 0,
    },
    tooltip: {
      trigger: "axis",
      valueFormatter: (value) => (value ? value.toFixed(2) + "%" : "-"),
      axisPointer: {
        // type: "shadow",
        label: {
          formatter: (params) => {
            let data = luxon.DateTime.fromMillis(parseInt(params.value));
            return data.toFormat("LLLL y");
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

// Calcula o consolidado de vários ativos dentro de um intervalo de tempo

function consolida(codigos) {
  let resultado = [];

  const ativos = extrato().codigo(codigos);
  const ate = luxon.DateTime.now();
  const de = ate.minus({ months: 6 }).startOf("month");
  resultado = luxon.Interval.fromDateTimes(de, ate)
    .splitBy({ months: 1 })
    .map((item) => item.start);
  if (resultado.at(-1).month != ate.month) resultado.push(ate);
  resultado.sort((a, b) => a - b);

  resultado.forEach((data, index) => {
    let investido = 0;
    let posicao = 0;
    let proventos = 0;

    codigos.forEach((codigo) => {
      const ativo = extrato().codigo(codigo).ate(data.endOf("month")); // Precisa contabilizar desde o início
      let cotacao = bolsaMes(codigo, data);
      let quantidade = ativo.quantidade;
      investido += ativo.investido;
      posicao += cotacao * quantidade;
      proventos += ativo.mes(data.month, data.year).proventos().valor; // Somente o mês do intervalo
    });

    resultado[index] = {
      data,
      posicao,
      proventos,
      investido,
    };
  });

  return resultado;
}
