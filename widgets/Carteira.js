import {
  extrato,
  poupancaAniversarios,
  poupancaCorrigida,
  ipcaMensal,
  cdiDiario,
  bolsaDia,
  formata,
  diasUteis,
  calcRentabilidade,
} from "/functions/index.js";

const template = `
<div class="card mb-4 shadow-lg">
  <div class="card-body">
    <div class="card-title mb-4">
      <h5 class="text-uppercase"><%= titulo %></h5>
    </div>
    <div class="row">
      <div class="col">
        <h6>Investido</h6>
        <p><%= formata(resultado.investido, 'BRL') %></p>
      </div>
      <div class="col">
        <h6>Posição</h6>
        <p><%= formata(resultado.posicao, 'BRL') %></p>
      </div>
      <div class="col">
        <h6>Valorização</h6>
        <p><span class="badge rounded-pill text-bg-<%= resultado.valorizacaoCor %>"><%= formata(resultado.valorizacao, 'porcentagem') %></span></p>
      </div>
      <div class="col">
        <h6>Rentabilidade</h6>
        <p><span class="badge rounded-pill text-bg-<%= resultado.rentabilidadeCor %>"><%= formata(resultado.rentabilidade, 'porcentagem')%></span></p>
      </div>
    </div>
    <div class="chart" style="height:200px"></div>
  </div>
</div>
`;

/**
 *  Widget que mostra o resumo da carteira de ativos
 */
export default function WidgetCarteira(element) {
  let ativos = element.getAttribute("data-ativos");
  ativos = ativos.split(",");

  // Carteira

  let series = [];
  let titulo = ativos.length > 1 ? "Carteira" : ativos[0];
  let consolidado = consolidar(ativos, function (codigo, timestamp) {
    const ativo = extrato().codigo(codigo).ate(timestamp);
    let cotacao = bolsaDia(codigo, timestamp);
    let quantidade = ativo.quantidade;
    return {
      investido: ativo.investido,
      posicao: cotacao * quantidade,
      proventos: ativo.proventos().valor,
    };
  });
  let final = consolidado.at(-1);

  let resultado = {
    investido: final.investido,
    posicao: final.posicao,
    valorizacao: calcRentabilidade(final.posicao, final.investido),
    rentabilidade: calcRentabilidade(
      final.posicao + final.proventos,
      final.investido
    ),
    valorizacaoCor: "success",
    rentabilidadeCor: "success",
  };

  series.push({
    name: titulo,
    type: "line",
    data: consolidado.map((item) => [
      item.timestamp,
      calcRentabilidade(item.posicao + item.proventos, item.investido),
    ]),
  });

  // Cores

  let poupanca = calcRentabilidade(
    poupancaCorrigida(
      final.investido,
      consolidado[0].timestamp,
      consolidado.at(-1).timestamp
    ),
    final.investido
  );

  if (resultado.rentabilidade < poupanca)
    resultado.rentabilidadeCor = "warning";
  if (resultado.rentabilidade < 0) resultado.rentabilidadeCor = "danger";
  if (resultado.valorizacao < 0) resultado.valorizacaoCor = "danger";

  // Render

  let html = ejs.render(template, { titulo, resultado, formata });
  element.innerHTML = html;

  grafico(element, series);
}

/**
 * Executa uma sequência diária de cálculos e retorna um consolidado dos dados.
 *
 * consolidar(codigos, function(codigo, timestamp) {
 *   const ativo = extrato().codigo(codigo).ate(timestamp);
 *   let cotacao = bolsaDia(codigo, timestamp);
 *   let quantidade = ativo.quantidade;
 *   return {
 *     investido: ativo.investido,
 *     posicao: cotacao * quantidade,
 *     proventos: ativo.proventos().valor,
 *   };
 * });
 *
 * @param {array} codigos - Array de códigos a serem consolidados
 * @param {function} callback - Função que recebe fn(codigo, timestamp) e deve retornar um objeto para somatória
 * @returns
 */

function consolidar(codigos, callback) {
  let consolidado = [];

  const dias = diasUteis(
    extrato().codigo(codigos).dados[0].data,
    luxon.DateTime.now().toMillis()
  );

  dias.forEach((timestamp) => {
    let resultado = [];
    codigos.forEach((codigo) => {
      resultado.push(callback.call(this, codigo, timestamp));
    });
    resultado = resultado.reduce((obj, item, index) => {
      for (let key in obj) obj[key] += index === 0 ? 0 : item[key];
      return obj;
    }, resultado[0]);
    consolidado.push({ timestamp, ...resultado });
  });

  return consolidado;
}

/**
 * Gráfico de linhas para mostrar a terjetória de um conjunto de investimentos
 * A primeira linha deve ser o investimento e será destacada, as demais são para os indicadores
 *
 * @param {DOM} element - Elemento do DOM para incorporar o gráfico
 * @param {object} series - Séries no formato do eCharts
 */
function grafico(element, series) {
  // Customiza a primeira série
  series[0] = Object.assign(
    {
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

  // Indicadores

  const serie = series[0].data;
  const de = luxon.DateTime.fromMillis(serie.at(0)[0]);
  const ate = serie.at(-1)[0];

  // Poupança

  series.push({
    name: "Poupança",
    type: "line",
    showSymbol: false,
    data: poupancaAniversarios(de, ate, true).map((item) => [
      item.dataFim,
      item.valor,
    ]),
  });

  // IPCA
  // TODO pode não ser preciso mas coloca o rastro do IPCA no gráfico

  series.push({
    name: "IPCA",
    type: "line",
    showSymbol: false,
    data: ipcaMensal(de.plus({ months: 1 }), ate, true).map((item) => [
      item.data,
      item.valor,
    ]),
  });

  // CDI

  series.push({
    name: "CDI",
    type: "line",
    showSymbol: false,
    data: cdiDiario(de, ate, true).map((item) => [item.data, item.valor]),
  });

  espalharIndicadores(series);

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
    dataZoom: [
      {
        type: "inside",
        throttle: 50,
        filterMode: "none",
        startValue: luxon.DateTime.now()
          .endOf("day")
          .minus({ months: 6 })
          .toMillis(),
        minValueSpan: 3600 * 24 * 1000 * 31, // 31 dias
        // zoomOnMouseWheel: false,
        // moveOnMouseMove: true,
        // moveOnMouseWheel: true,
        // preventDefaultMouseMove: false,
      },
    ],
    tooltip: {
      trigger: "axis",
      valueFormatter: (value) => (value ? value.toFixed(2) + "%" : value),
      axisPointer: {
        label: {
          formatter: (params) => {
            let data = luxon.DateTime.fromMillis(parseInt(params.value));
            return data.toFormat("dd LLLL y");
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

// Espalha os dados de Poupança e IPCA que são mensais pelos dias úteis do gráfico
// Útil para fazer o tooltip acompanhar estas informações.

function espalharIndicadores(series) {
  const dados = series[0].data;
  const de = dados.at(0)[0];
  const ate = dados.at(-1)[0];
  const dias = diasUteis(de, ate);
  series.forEach((serie) => {
    if (["Poupança", "IPCA"].includes(serie.name)) {
      let resultado = dias.map((dia) => {
        let item = serie.data.findLast((item) => item[0] <= dia);
        return [dia, item ? item[1] : 0];
      });
      serie.data = resultado;
    }
  });
}

// Distribui o valor mensal ao longo dos dias úteis do mês proporcionalmente
// Acompanha o gráfico diário servindo para mostrar uma evolução
// TODO esta não é a melhor maneira, apenas um improvisado

// function distribuido(de, ate, dados = []) {
//   let resultado = [];
//   let acumulado = 0;
//   dados.forEach((item) => {
//     const data = luxon.DateTime.fromMillis(item.data);
//     const dias = diasUteis(
//       data.startOf("month").toMillis(),
//       data.endOf("month").toMillis()
//     );
//     dias.forEach((dia) => {
//       if (dia < de || dia > ate) return; // Exclui dias fora do período
//       acumulado += item.valor / dias.length;
//       resultado.push({
//         data: dia,
//         valor: acumulado,
//       });
//     });
//   });
//   return resultado;
// }
