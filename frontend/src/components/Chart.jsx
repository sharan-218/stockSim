import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import {
  computePercentile,
  computeAveragePath,
} from "../utils/monteCarlo";

export default function Chart({ historical, simulatedPaths = [], mode = "paths" }) {
  if (!historical?.length) return null;

  const baseColors = [
    "#3C7CDC", "#2CA97E", "#A616CA", "#E45B5B", "#8C6ADE",
    "#E07B39", "#D6619C", "#28B3A7", "#6673E0", "#3658F0",
  ];

  const {
    labels,
    historicalSeries,
    simulatedSeries,
    percentileSeries,
    averageSeries,
    yMin,
    yMax,
  } = useMemo(() => {


    const HIST_WINDOW = 20;
    const slicedHistorical = historical.slice(-HIST_WINDOW);

    const historicalLabels = slicedHistorical.map((h) =>
      h.open_time.split("T")[0]
    );
    const historicalData = slicedHistorical.map((h) => h.close);

    const maxLen = Math.max(0, ...simulatedPaths.map((p) => p.length));
    const EXTRA = 1;

    const lastTs = new Date(historical.at(-1).open_time).getTime();
    const dayMs = 86400000;

    const futureLabels = Array.from(
      { length: maxLen + EXTRA },
      (_, i) => new Date(lastTs + dayMs * (i + 1)).toISOString().split("T")[0]
    );

    const labels = [...historicalLabels, ...futureLabels];

    const futureValues = simulatedPaths.flat().filter((v) => Number.isFinite(v));
    const allValues = [...historicalData, ...futureValues];

    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const pad = (max - min) * 0.15;

    const yMin = min - pad;
    const yMax = max + pad;

    const padArray = Array(historicalData.length - 1).fill(null);
    padArray.push(historicalData.at(-1));

    const historicalSeries = {
      name: "Historical",
      type: "line",
      smooth: true,
      sampling: "lttb",
      symbol: "none",
      color: baseColors[0],
      lineStyle: { width: 2.2, color: baseColors[0] },
      data: historicalData,
    };

    const simulatedSeries =
      mode === "paths"
        ? simulatedPaths.slice(0, 2000).map((path, idx) => {
          const c = baseColors[idx % baseColors.length];

          return {
            name: idx + 1,
            type: "line",
            smooth: true,
            symbol: "none",
            sampling: "lttb",

            color: c,

            lineStyle: {
              width: 1,
              opacity: 0.7,
              color: c,
            },

            data: [...padArray, ...path],
          };
        })
        : [];

    let percentileSeries = [];
    if (mode === "percentiles" && simulatedPaths.length > 0) {
      const p5 = computePercentile(simulatedPaths, 5);
      const p25 = computePercentile(simulatedPaths, 25);
      const p50 = computePercentile(simulatedPaths, 50);
      const p75 = computePercentile(simulatedPaths, 75);
      const p95 = computePercentile(simulatedPaths, 95);

      percentileSeries = [
        {
          name: "5–95%",
          type: "line",
          lineStyle: { opacity: 0 },
          color: baseColors[1],
          areaStyle: { color: "rgba(44,169,125,0.18)" },
          data: [...padArray, ...p95],
          symbol: "circle",
        },
        {
          name: "25–75%",
          type: "line",
          lineStyle: { opacity: 0 },
          symbol: "circle",
          color: baseColors[2],
          areaStyle: { color: "rgba(166,22,202,0.18)" },
          data: [...padArray, ...p75],
        },
        {
          name: "Median",
          type: "line",
          smooth: true,
          symbol: "none",
          lineStyle: { width: 3, color: "#E45B5B" },
          data: [...padArray, ...p50],
        },
      ];
    }

    const averageSeries =
      mode === "average" && simulatedPaths.length > 0
        ? [
          {
            name: "Average",
            type: "line",
            smooth: true,
            symbol: "none",
            sampling: "lttb",
            color: baseColors[1],
            lineStyle: { width: 3, color: baseColors[1] },
            data: [...padArray, ...computeAveragePath(simulatedPaths)],
          },
        ]
        : [];

    return {
      labels,
      historicalSeries,
      simulatedSeries,
      percentileSeries,
      averageSeries,
      yMin,
      yMax,
    };
  }, [historical, simulatedPaths, mode]);

  const option = useMemo(
    () => ({
      backgroundColor: "transparent",

      tooltip: {
        trigger: "axis",
        axisPointer: { type: "cross" },
        confine: true,
        appendToBody: true,

        formatter: function (params) {
          const filtered = params.filter(
            (p) => p.data !== null && p.data !== undefined
          );
          if (!filtered.length) return "";

          let html = `<strong>${filtered[0].axisValue}</strong><br/>`;

          filtered.forEach((p) => {
            const color = p.color;

            html += `
              <div style="margin:2px 0; display:flex; align-items:center; gap:6px;">
                <span style="
                  display:inline-block;
                  width:10px;
                  height:10px;
                  border-radius:50%;
                  background:${color};
                "></span>
                <span><b>${p.seriesName}</b>: ${Number(p.data).toFixed(2)}</span>
              </div>
            `;
          });

          return `<div style="padding:6px 10px;">${html}</div>`;
        },
      },

      animation: false,

      grid: {
        left: 5,
        right: 5,
        top: 20,
        bottom: 60,
        containLabel: true,
      },

      xAxis: {
        type: "category",
        data: labels,
        axisTick: { show: false },
        axisLabel: {
          color: "#A6ADBB",
          fontSize: window.innerWidth < 480 ? 9 : 10,
          rotate: -25,
        },
      },

      yAxis: {
        type: "value",
        min: yMin.toFixed(0),
        max: yMax.toFixed(0),
        axisLabel: { color: "#A6ADBB", fontSize: 10 },
        splitLine: {
          lineStyle: { type: "dashed", color: "#23232344" },
        },
      },

      dataZoom: [
        { type: "inside", throttle: 50 },
        {
          type: "slider",
          height: 22,
          handleSize: 14,
          backgroundColor: "rgba(120,120,120,0.1)",
          fillerColor: "rgba(100,140,255,0.18)",
          borderColor: "transparent",
        },
      ],

      series: [
        historicalSeries,
        ...simulatedSeries,
        ...percentileSeries,
        ...averageSeries,
      ],
    }),
    [
      labels,
      yMin,
      yMax,
      historicalSeries,
      simulatedSeries,
      percentileSeries,
      averageSeries,
    ]
  );

  return (
    <div className="w-full h-[65vh] md:h-[70vh] rounded-2xl p-2">
      <ReactECharts
        option={option}
        notMerge={true}
        lazyUpdate={true}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
