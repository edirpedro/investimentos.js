import { extrato, formata } from "/functions/index.js";

const template = `
<div class="card mb-4 shadow-lg">
  <div class="card-body">
    <h5 class="card-title text-uppercase">Proventos</h5>
    <p class="card-text small">Valores recebidos até hoje, inclui Rendimentos, Dividendos e JCP.</p>
    <div class="chart" style="height:400px"></div>
  </div>
</div>
<div class= "row">
  <div class="col">
    <div class="card mb-4 shadow-lg">
      <div class="card-body">
        <span class="fs-4"><%- formata(media, 'BRL') %></span><br />
        Por mês
      </div>
    </div>
  </div>
  <div class="col">
    <div class="card mb-4 shadow-lg">
      <div class="card-body">
        <span class="fs-4"><%- formata(acumulado, 'BRL') %></span><br />
        Total acumulado
      </div>
    </div>
  </div>
</div>
<div class="card mb-4 shadow-lg">
  <div class="card-body">
    <table class="table text-end">
      <thead>
        <tr>
          <td></td>
          <th>Total</th>
          <th>Média</th>
        </tr>
      </thead>
      <tbody class="table-group-divider">
        <% proventos.forEach((item) => { %>
        <tr>
          <th class="text-start"><%= item.codigo %></th>
          <td><%- formata(item.acumulado, 'BRL') %></td>
          <td><%- formata(item.media, 'BRL') %></td>
        </tr>
        <% }); %>
      </tbody>
    </table>
  </div>
</div>
`;

/**
 *  Página que mostra o resumo de proventos
 */
export default function PageProventos(element) {
  let codigos = extrato().produtos("ativos");
  let series = [];

  let termina = luxon.DateTime.now().endOf("month");
  let comeca = termina.minus({ month: 11 }).endOf("month");
  let intervalo = [];
  while (comeca.toMillis() < termina.toMillis()) {
    intervalo.push(comeca);
    comeca = comeca.plus({ month: 1 }).endOf("month");
  }
  intervalo.push(termina);

  codigos.forEach((codigo) => {
    let proventos = [];
    intervalo.forEach((data) => {
      proventos.push([
        data.toMillis(),
        extrato().codigo(codigo).mes(data.month, data.year).proventos().valor,
      ]);
    });
    series.push({
      name: codigo,
      type: "bar",
      stack: "Total",
      data: proventos,
    });
  });

  // Totais no topo de cada mês

  let totais = [];
  intervalo.forEach((item, index) => {
    totais.push(series.reduce((sum, item) => (sum += item.data[index][1]), 0));
  });

  series.at(-1)["label"] = {
    show: true,
    position: "top",
    formatter: (params) => {
      return formata(totais[params.dataIndex], "BRL");
    },
  };

  // Tabela

  let proventos = extrato()
    .produtos("ativos")
    .map((codigo) => {
      const proventos = extrato().codigo(codigo).proventos();
      return {
        codigo,
        acumulado: proventos.valor,
        media: proventos.valorMedio,
      };
    });
  proventos.sort((a, b) => b.acumulado - a.acumulado);

  // Acumulado

  let acumulado = proventos.reduce((sum, item) => (sum += item.acumulado), 0);

  // Média

  let media = proventos.reduce((sum, item) => (sum += item.media), 0);

  let html = ejs.render(template, {
    proventos,
    acumulado,
    media,
    formata,
  });
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
      axisLabel: {
        show: false,
      },
    },
    grid: {
      top: 25,
      bottom: 25,
      left: 150,
      right: 0,
      containLabel: false,
    },
    legend: {
      show: true,
      top: 0,
      left: 0,
      orient: "vertical",
    },
    tooltip: {
      trigger: "axis",
      valueFormatter: (value) => (value ? formata(value, "BRL") : value),
      axisPointer: {
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
