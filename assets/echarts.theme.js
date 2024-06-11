/**
 * Tema para eCharts
 * https://echarts.apache.org/en/theme-builder.html
 */
echarts.registerTheme("tema", {
  color: [
    // Cores do Bootstrap
    "#0d6efd", // blue
    "#20c997", // teal
    "#ffc107", // yellow
    "#dc3545", // red
    "#0dcaf0", // cyan
    "#6610f2", // indigo
    "#198754", // green
    "#d63384", // pink
    "#fd7e14", // orange
    "#6f42c1", // purple
  ],
  // backgroundColor: "#212529",
  backgroundColor: "transparent",
  textStyle: {
    color: "#fff",
  },
  label: {
    color: "#fff",
  },
  legend: {
    icon: "circle",
    textStyle: {
      color: "#fff",
    },
  },
  tooltip: {
    backgroundColor: "#212529",
    borderColor: "#666",
    textStyle: {
      color: "#fff",
    },
  },
  line: {
    symbol: "circle",
    symbolSize: 6,
  },
});
