import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
function computePercentile(paths, percentile) {
  const maxLen = Math.max(...paths.map((p) => p.length));
  return Array.from({ length: maxLen }, (_, i) => {
    const vals = paths.map((p) => p[i]).filter((v) => v !== undefined);
    if (vals.length === 0) return null;
    vals.sort((a, b) => a - b);
    const idx = Math.floor((percentile / 100) * vals.length);
    return vals[idx] ?? vals[vals.length - 1];
  });
}

function computeAveragePath(paths) {
  const maxLen = Math.max(...paths.map((p) => p.length));
  return Array.from({ length: maxLen }, (_, i) => {
    const vals = paths.map((p) => p[i]).filter(Boolean);
    if (vals.length === 0) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  });
}

export default function Chart({
  historical,
  simulatedPaths = [],
  mode = "paths",
}) {
  if (!historical || historical.length === 0) return null;

  const baseColors = [
    "#3C7CDC",
    "#2CA97E",
    "#A616CA",
    "#E45B5B",
    "#8C6ADE",
    "#E07B39",
    "#D6619C",
    "#28B3A7",
    "#6673E0",
    "#3658F0",
    "#4D9FEC",
    "#34C19F",
    "#F28A2E",
  ];



  const historicalLabels = historical.map((h) =>
    h.open_time.split("T")[0]
  );
  const historicalData = historical.map((h) => h.close);

  const maxFuture = Math.max(0, ...simulatedPaths.map((p) => p.length));
  const lastDate = new Date(historical[historical.length - 1].open_time);

  const futureLabels = Array.from({ length: maxFuture }, (_, i) => {
    const next = new Date(lastDate);
    next.setDate(next.getDate() + i + 1);
    return next.toISOString().split("T")[0];
  });

  const labels = [...historicalLabels, ...futureLabels];

  const historicalSeries = {
    name: "Historical",
    type: "line",
    smooth: true,
    symbol: "circle",
    symbolSize: 5,
    lineStyle: { width: 3, color: baseColors[0] },
    data: historicalData,
  };

  const simulatedSeries =
    mode === "paths"
      ? simulatedPaths.map((path, idx) => ({
        name: idx + 1,
        type: "line",
        smooth: true,
        symbol: "none",
        lineStyle: {
          width: 1.2,
          type: "line",
          color: baseColors[(idx + 1) % baseColors.length],
        },
        emphasis: { focus: "series" },
        connectNulls: false,
        data: [
          ...Array(historicalData.length - 1).fill(null),
          historicalData[historical.length - 1],
          ...path,
        ],
      }))
      : [];

  const percentilesSeries = [];

  if (mode === "percentiles" && simulatedPaths.length > 0) {
    const p5 = computePercentile(simulatedPaths, 5);
    const p25 = computePercentile(simulatedPaths, 25);
    const p50 = computePercentile(simulatedPaths, 50);
    const p75 = computePercentile(simulatedPaths, 75);
    const p95 = computePercentile(simulatedPaths, 95);

    const pad = Array(historical.length - 1).fill(null);

    percentilesSeries.push(
      {
        name: "5–95%",
        type: "line",
        data: [...pad, ...p95],
        lineStyle: { opacity: 0 },
        areaStyle: { color: "rgba(100,116,139,0.12)" },
      },
      {
        name: "25–75%",
        type: "line",
        data: [...pad, ...p75],
        lineStyle: { opacity: 0 },
        areaStyle: { color: "rgba(100,116,139,0.25)" },
      },
      {
        name: "Median (P50)",
        type: "line",
        smooth: true,
        symbol: "none",
        lineStyle: { width: 3, color: "#E45B5B" },
        data: [...pad, ...p50],
      }
    );
  }

  const averageSeries =
    mode === "average" && simulatedPaths.length > 0
      ? (() => {
        const avg = computeAveragePath(simulatedPaths);
        const pad = Array(historical.length - 1).fill(null);
        return [
          {
            name: "Average",
            type: "line",
            smooth: true,
            lineStyle: { width: 3 },
            data: [...pad, ...avg],
          },
        ];
      })()
      : [];

  const options = useMemo(
    () => ({
      color: baseColors,
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "cross" },
      },
      backgroundColor: "transparent",
      renderer: "canvas",


      grid: {
        top: 20,
        left: window.innerWidth < 480 ? 5 : 5,
        right: 5,
        bottom: 60,
        containLabel: true,
      },


      xAxis: {
        type: "category",
        data: labels,
        axisLabel: {
          color: "#A6ADBB", rotate: -25, interval: "auto",
          fontSize: window.innerWidth < 480 ? 9 : 10,
        },
        axisTick: { show: false },
      },

      yAxis: {
        type: "value",
        axisLabel: { color: "#A6ADBB", fontSize: 10, interval: 'auto' },
        splitLine: {
          show: true,
          lineStyle: { color: "#2323233a", type: "dashed" },
        },
      },

      dataZoom: [
        { type: "inside", throttle: 30 },
        {
          type: "slider",
          height: window.innerWidth < 480 ? 12 : 20,
          bottom: window.innerWidth < 480 ? 5 : 20,
          handleSize: window.innerWidth < 480 ? 10 : 20,
          borderColor: "transparent",
          backgroundColor: "rgba(4, 12, 26, 0.87)",
          fillerColor: "rgba(126, 160, 207, 0.35)",
          handleColor: "#09121c6e",
          textStyle: { color: "#d3d5ffe5" },
        },
      ]
      ,
      series: [
        historicalSeries,
        ...simulatedSeries,
        ...percentilesSeries,
        ...averageSeries,
      ],
    }),
    [mode, labels, simulatedPaths]
  );

  return (
    <div className="w-full h-[65vh] md:h-[70vh] rounded-2xl p-2">
      <ReactECharts
        option={options}
        style={{ width: "100%", height: "100%" }}
        notMerge={true}
        lazyUpdate={true}
        key={mode}
      />
    </div>
  );
}
