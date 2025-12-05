import React from "react";
import ReactECharts from "echarts-for-react";
import {
  computePercentile,
  computeAveragePath,
} from '../utils/monteCarlo';
export default function Chart({ historical, simulatedPaths = [], mode = "paths" }) {
  if (!historical || historical.length === 0) return null;

  const baseColors = [
    "#3C7CDC", "#2CA97E", "#A616CA", "#E45B5B", "#8C6ADE",
    "#E07B39", "#D6619C", "#28B3A7", "#6673E0", "#3658F0",
    "#4D9FEC", "#34C19F", "#F28A2E",
  ];

  const HIST_WINDOW = 15;
  const slicedHistorical = historical.slice(-HIST_WINDOW);

  const historicalLabels = slicedHistorical.map((h) =>
    h.open_time.split("T")[0]
  );
  const historicalData = slicedHistorical.map((h) => h.close);

  const maxFuture = Math.max(0, ...simulatedPaths.map((p) => p.length));
  const EXTRA_FUTURE = 2;

  const lastDate = new Date(historical[historical.length - 1].open_time);
  const baseTime = lastDate.getTime();
  const dayMs = 86400000;

  const futureLabels = Array.from(
    { length: maxFuture + EXTRA_FUTURE },
    (_, i) =>
      new Date(baseTime + dayMs * (i + 1)).toISOString().split("T")[0]
  );

  const labels = [...historicalLabels, ...futureLabels];

  const cleanValues = (() => {
    const vals = [...historicalData];
    for (const p of simulatedPaths) vals.push(...p);
    return vals.filter((v) => typeof v === "number" && !isNaN(v));
  })();

  const minPrice = Math.min(...cleanValues);
  const maxPrice = Math.max(...cleanValues);
  const range = Math.min(0.001, maxPrice - minPrice);
  const pad = range * 0.1;

  const yMin = minPrice - pad;
  const yMax = maxPrice + pad;


  const simPad = (() => {
    const pad = Array(historicalData.length - 1).fill(null);
    pad.push(historicalData[historicalData.length - 1]);
    return pad;
  })();


  const percentiles =
    simulatedPaths.length > 0
      ? {
        p5: computePercentile(simulatedPaths, 5),
        p25: computePercentile(simulatedPaths, 25),
        p50: computePercentile(simulatedPaths, 50),
        p75: computePercentile(simulatedPaths, 75),
        p95: computePercentile(simulatedPaths, 95),
      }
      : null;

  const avgPath =
    simulatedPaths.length > 0 ? computeAveragePath(simulatedPaths) : null;


  const historicalSeries = {
    name: "Historical",
    type: "line",
    smooth: true,
    symbolSize: 5,
    animation: false,
    sampling: "lttb",
    lineStyle: { width: 3, color: baseColors[0] },
    data: historicalData,
  };


  const simulatedSeries =
    mode === "paths"
      ? simulatedPaths.map((path, idx) => ({
        name: `${idx + 1}`,
        type: "line",
        smooth: true,
        sampling: "lttb",
        symbol: "none",

        lineStyle: {
          width: 1.2,
          color: baseColors[(idx + 1) % baseColors.length],
        },
        itemStyle: {
          color: baseColors[(idx + 1) % baseColors.length],
        },

        connectNulls: false,
        animation: false,
        data: [...simPad, ...path],
      }))
      : [];



  const percentilesSeries =
    mode === "percentiles" && percentiles
      ? [
        {
          name: "5–95%",
          type: "line",
          animation: false,
          sampling: "lttb",
          data: [...simPad, ...percentiles.p95],
          lineStyle: { opacity: 0 },
          areaStyle: { color: "rgba(44,169,125,0.2)" },
        },
        {
          name: "25–75%",
          type: "line",
          animation: false,
          sampling: "lttb",
          data: [...simPad, ...percentiles.p75],
          lineStyle: { opacity: 0 },
          color: baseColors[2],
          areaStyle: { color: "rgba(166,22,202,0.2)" },
        },
        {
          name: "Median (P50)",
          type: "line",
          smooth: true,
          symbol: "none",
          animation: false,
          sampling: "lttb",
          lineStyle: { width: 3, color: "#E45B5B" },
          itemStyle: {
            color: "#E45B5B"
          },
          data: [...simPad, ...percentiles.p50],
        },
      ]
      : [];

  const averageSeries =
    mode === "average" && avgPath
      ? [
        {
          name: "Average",
          type: "line",
          smooth: true,
          animation: false,
          sampling: "lttb",
          symbol: "none",
          color: baseColors[1],
          lineStyle: { width: 3, color: baseColors[1] },
          data: [...simPad, ...avgPath],
        },
      ]
      : [];


  const options = {
    backgroundColor: "transparent",
    colors: baseColors,
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      formatter: function (params) {
        const active = params.filter(p => p.data !== null && p.data !== undefined);

        if (active.length === 0) return "";
        let html = `<strong>${active[0].axisValue}</strong><br/>`;

        active.forEach((p) => {
          html += `
        <span style="
          display:inline-block;
          width:10px;
          height:10px;
          border-radius:50%;
          margin-right:6px;
          background:${p.color};
          ">
        </span>
        <b>${p.seriesName} : ${p.data.toFixed(4)}</b><br/>
      `;
        });

        return `<div style="padding:4px 8px;">${html}</div>`;
      }
    }
    ,

    grid: {
      top: 20,
      left: 5,
      right: 5,
      bottom: 60,
      containLabel: true,
    },

    xAxis: {
      type: "category",
      data: labels,
      axisLabel: {
        color: "#A6ADBB",
        rotate: -25,
        fontSize: window.innerWidth < 480 ? 9 : 10,
      },
      axisTick: { show: false },
    },

    yAxis: {
      type: "value",
      min: yMin.toFixed(3),
      max: yMax.toFixed(3),
      axisLabel: { color: "#A6ADBB", fontSize: 10 },
      splitLine: {
        show: true,
        lineStyle: { color: "#2323233a", type: "dashed" },
      },
    },

    dataZoom: [
      {
        type: "inside",
        throttle: 35,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
      },
      {
        type: "slider",
        handleSize: 16,
        height: 25,
        handleStyle: { color: "#7092ff" },
        borderColor: "transparent",
        fillerColor: "rgba(112,146,255,0.2)",
        backgroundColor: "rgba(50,50,50,0.3)",
      }
    ],

    series: [
      historicalSeries,
      ...simulatedSeries,
      ...percentilesSeries,
      ...averageSeries,
    ],
  };

  return (
    <div className="w-full h-[65vh] md:h-[70vh] rounded-2xl p-2">
      <ReactECharts
        option={options}
        notMerge={true}
        lazyUpdate={false}
        opts={{ useDirtyRect: true }}
        style={{ width: "100%", height: "100%" }}
        key={mode}
      />
    </div>
  );
}
